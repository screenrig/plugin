"""Validated definitions and append-only observations in local SQLite."""
from contextlib import contextmanager
import csv
from datetime import datetime, timezone, date
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
import os
from pathlib import Path
import re
import sqlite3
import sys

MAX_BYTES = 64 * 1024 * 1024
MAX_ROWS = 100000
ID = re.compile(r'^[a-z][a-z0-9_-]{0,63}$')


class Error(Exception):
    def __init__(self, code, message, **details):
        super().__init__(message)
        self.code, self.details = code, details


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False)


def sha(value):
    return hashlib.sha256(value if isinstance(value, bytes) else canonical(value).encode()).hexdigest()


def load(path):
    raw = Path(path).read_bytes()
    if len(raw) > MAX_BYTES:
        raise Error('limit_exceeded', 'Input exceeds 64 MiB.')
    try:
        return json.loads(raw, parse_constant=lambda v: (_ for _ in ()).throw(ValueError(v)))
    except (ValueError, UnicodeError) as exc:
        raise Error('invalid_input', 'Expected UTF-8 JSON.') from exc


def atomic(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + f'.{os.getpid()}.tmp')
    with temporary.open('wb') as output:
        output.write(data if isinstance(data, bytes) else canonical(data).encode())
        output.flush()
        os.fsync(output.fileno())
    os.replace(temporary, path)


def default_home():
    if os.environ.get('SCREENRIG_DASHBOARD_HOME'):
        return Path(os.environ['SCREENRIG_DASHBOARD_HOME']).expanduser()
    if sys.platform == 'darwin':
        return Path.home() / 'Library/Application Support/screenrig/dashboards'
    if os.name == 'nt':
        return Path(os.environ['LOCALAPPDATA']) / 'screenrig/dashboards'
    return Path(os.environ.get('XDG_DATA_HOME', Path.home() / '.local/share')) / 'screenrig/dashboards'


def identifier(value):
    if not isinstance(value, str) or not ID.fullmatch(value):
        raise Error('invalid_definition', 'IDs must be lowercase identifiers, at most 64 characters.')
    return value


def instant(value):
    try:
        result = datetime.fromisoformat(value.replace('Z', '+00:00'))
        if result.tzinfo is None:
            raise ValueError()
        return result.astimezone(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
    except (ValueError, AttributeError, TypeError) as exc:
        raise Error('invalid_time', 'Timestamps require an explicit UTC offset.') from exc


def sqltype(field):
    return 'INTEGER' if field['type'] in ('integer', 'decimal', 'boolean') else 'TEXT'


def normalize(value, field):
    kind = field['type']
    if value is None:
        if not field.get('nullable', False):
            raise Error('schema_mismatch', 'Required field is null.')
        return None, None
    if kind in ('integer', 'decimal'):
        if isinstance(value, (bool, float)):
            raise Error('schema_mismatch', 'Use integers or decimal strings, not binary float values.')
        try:
            number = Decimal(str(value))
            scale = field.get('scale', 0) if kind == 'decimal' else 0
            scaled = number * (10 ** scale)
            if not number.is_finite() or scaled != scaled.to_integral_value() or abs(scaled) > 2**63 - 1:
                raise ValueError()
            if 'minimum' in field and number < Decimal(str(field['minimum'])):
                raise ValueError()
            if 'maximum' in field and number > Decimal(str(field['maximum'])):
                raise ValueError()
            return (int(number) if kind == 'integer' else format(number, f'.{scale}f')), int(scaled)
        except (ValueError, InvalidOperation, OverflowError) as exc:
            raise Error('schema_mismatch', 'Invalid numeric range or precision.') from exc
    if kind == 'boolean':
        if not isinstance(value, bool):
            raise Error('schema_mismatch', 'Expected boolean.')
        return value, int(value)
    if kind == 'json':
        encoded = canonical(value)
        if len(encoded) > 32768:
            raise Error('limit_exceeded', 'JSON field exceeds 32 KiB.')
        return value, encoded
    if not isinstance(value, str) or len(value.encode()) > 32768:
        raise Error('schema_mismatch', 'Expected text within 32 KiB.')
    if kind == 'timestamp':
        value = instant(value)
    if kind == 'date':
        try:
            if date.fromisoformat(value).isoformat() != value:
                raise ValueError()
        except ValueError as exc:
            raise Error('schema_mismatch', 'Expected YYYY-MM-DD date.') from exc
    if 'enum' in field and value not in field['enum']:
        raise Error('schema_mismatch', 'Value is outside the saved enumeration.')
    return value, value


class Store:
    def __init__(self, root):
        self.root = Path(root).expanduser().resolve()
        self.root.mkdir(parents=True, exist_ok=True, mode=0o700)
        if sqlite3.sqlite_version_info < (3, 37):
            raise Error('runtime_missing', 'SQLite 3.37+ is required.')
        self.db = sqlite3.connect(self.root / 'data.sqlite', timeout=5, isolation_level=None)
        self.db.row_factory = sqlite3.Row
        self.db.execute('PRAGMA foreign_keys=ON')
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.execute('PRAGMA synchronous=FULL')
        version = self.db.execute('PRAGMA user_version').fetchone()[0]
        if version not in (0, 1):
            raise Error('definition_incompatible', 'Unsupported workspace version.')
        self.db.executescript('''
          CREATE TABLE IF NOT EXISTS datasets(id TEXT PRIMARY KEY, definition TEXT NOT NULL, digest TEXT NOT NULL) STRICT;
          CREATE TABLE IF NOT EXISTS ingestions(seq INTEGER PRIMARY KEY, digest TEXT UNIQUE NOT NULL, receipt TEXT NOT NULL) STRICT;
          CREATE TABLE IF NOT EXISTS attempts(id INTEGER PRIMARY KEY, digest TEXT NOT NULL, outcome TEXT NOT NULL) STRICT;
          CREATE TABLE IF NOT EXISTS dashboards(id TEXT NOT NULL, revision INTEGER NOT NULL, definition TEXT NOT NULL,
            digest TEXT NOT NULL, PRIMARY KEY(id,revision)) STRICT;
          CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY, dashboard TEXT NOT NULL, revision INTEGER NOT NULL,
            seq INTEGER NOT NULL, status TEXT NOT NULL, result TEXT NOT NULL) STRICT;
          PRAGMA user_version=1;
        ''')
        if os.name != 'nt':
            os.chmod(self.root / 'data.sqlite', 0o600)

    @contextmanager
    def transaction(self, write=False):
        self.db.execute('BEGIN IMMEDIATE' if write else 'BEGIN')
        try:
            yield
            self.db.execute('COMMIT')
        except BaseException:
            self.db.execute('ROLLBACK')
            raise

    def dataset(self, name):
        identifier(name)
        row = self.db.execute('SELECT definition FROM datasets WHERE id=?', (name,)).fetchone()
        if not row:
            raise Error('dataset_missing', f'No registered dataset: {name}')
        return json.loads(row[0])

    def register(self, definition):
        name = identifier(definition['id'])
        fields = definition['fields']
        if not fields or len(fields) > 128:
            raise Error('invalid_definition', 'Expected 1 to 128 fields.')
        for key, field in fields.items():
            identifier(key)
            if field.get('type') not in ('integer','decimal','string','boolean','date','timestamp','json'):
                raise Error('invalid_definition', 'Unsupported field type.')
            if field['type'] == 'decimal' and not (0 <= field.get('scale', 0) <= 9):
                raise Error('invalid_definition', 'Decimal scale must be between 0 and 9.')
        keys = definition['key']
        if not keys or len(set(keys)) != len(keys) or any(k not in fields or fields[k].get('nullable') or fields[k]['type'] == 'json' for k in keys):
            raise Error('invalid_definition', 'Natural key fields must be non-null scalar fields.')
        time = definition['time_field']
        if time not in fields or fields[time]['type'] != 'timestamp' or fields[time].get('nullable'):
            raise Error('invalid_definition', 'time_field must be a required timestamp.')
        if not definition.get('grain') or not definition.get('description'):
            raise Error('invalid_definition', 'Record grain and description are required.')
        with self.transaction(True):
            old = self.db.execute('SELECT digest FROM datasets WHERE id=?', (name,)).fetchone()
            if old:
                if old[0] != sha(definition):
                    raise Error('schema_mismatch', 'Dataset exists with a different schema; do not redefine it during refresh.')
                return {'id': name, 'created': False}
            columns = ','.join(f'"{key}" {sqltype(field)}' for key, field in fields.items())
            self.db.execute(f'''CREATE TABLE "d_{name}" (_key TEXT NOT NULL, _revision INTEGER NOT NULL,
              _seq INTEGER NOT NULL REFERENCES ingestions(seq), _time TEXT NOT NULL, _hash TEXT NOT NULL,
              _data TEXT NOT NULL, {columns}, PRIMARY KEY(_key,_revision)) STRICT''')
            self.db.execute(f'CREATE INDEX "i_{name}" ON "d_{name}"(_time,_seq)')
            self.db.execute('INSERT INTO datasets VALUES(?,?,?)', (name, canonical(definition), sha(definition)))
        return {'id': name, 'created': True}

    def list_datasets(self, search=''):
        rows = self.db.execute('SELECT id,definition,digest FROM datasets ORDER BY id').fetchall()
        return [dict(r) | {'definition':json.loads(r['definition'])} for r in rows if search.lower() in r['definition'].lower()]

    def ingest(self, batch, base, correction=False, dry_run=False):
        prepared, seen, originals = [], {}, []
        for relative in batch.get('sources', []):
            raw = (Path(base) / relative).read_bytes()
            if len(raw) > MAX_BYTES:
                raise Error('limit_exceeded', 'Source exceeds 64 MiB.')
            originals.append(sha(raw))
            if not dry_run:
                atomic(self.root / 'sources' / sha(raw) / 'source', raw)
        for entry in batch['inputs']:
            definition = self.dataset(entry['dataset'])
            source = (Path(base) / entry['path']).resolve()
            raw = source.read_bytes()
            if len(raw) > MAX_BYTES:
                raise Error('limit_exceeded', 'Input exceeds 64 MiB.')
            if source.suffix.lower() in ('.csv','.tsv'):
                reader = csv.DictReader(io.StringIO(raw.decode('utf-8-sig')), delimiter='\t' if source.suffix == '.tsv' else ',')
                if reader.fieldnames is None or len(set(reader.fieldnames)) != len(reader.fieldnames):
                    raise Error('invalid_input', 'CSV headers must be unique.')
                records = list(reader)
            elif source.suffix == '.ndjson':
                records = [json.loads(line) for line in raw.splitlines() if line.strip()]
            else:
                records = json.loads(raw)
            if not isinstance(records, list) or len(records) > MAX_ROWS:
                raise Error('invalid_input', 'Expected a record array, at most 100,000 records.')
            source_digest = sha(raw)
            for index, record in enumerate(records):
                if not isinstance(record, dict) or set(record) - set(definition['fields']):
                    raise Error('schema_mismatch', 'Unknown input fields.', dataset=definition['id'], row=index+1)
                normalized, sqlvalues = {}, []
                try:
                    for key, field in definition['fields'].items():
                        normalized[key], sqlvalue = normalize(record.get(key), field)
                        sqlvalues.append(sqlvalue)
                except Error as exc:
                    exc.details.update(dataset=definition['id'], row=index+1, field=key)
                    raise
                natural = sha([normalized[k] for k in definition['key']])
                value_hash = sha(normalized)
                identity = (definition['id'], natural)
                if identity in seen:
                    if seen[identity] != value_hash:
                        raise Error('record_conflict', 'Conflicting keys inside one batch.')
                    continue
                seen[identity] = value_hash
                prepared.append((definition, natural, value_hash, normalized, sqlvalues, source_digest))
            if not dry_run:
                atomic(self.root / 'sources' / source_digest / 'source', raw)
        if len(prepared) > MAX_ROWS:
            raise Error('limit_exceeded', 'Batch exceeds 100,000 records.')
        prepared.sort(key=lambda item: (item[0]['id'], item[1]))
        batch_digest = sha([(d['id'],sha(d),k,h) for d,k,h,*_ in prepared])
        receipt = {'inserted':0,'duplicates':0,'corrected':0,'digest':batch_digest,
                   'sources':sorted(set([*originals, *(item[-1] for item in prepared)]))}
        with self.transaction(True):
            existing = self.db.execute('SELECT seq,receipt FROM ingestions WHERE digest=?', (batch_digest,)).fetchone()
            if existing:
                if not dry_run:
                    self.db.execute('INSERT INTO attempts(digest,outcome) VALUES(?,?)', (batch_digest,'duplicate'))
                return receipt | {'duplicates':len(prepared), 'seq':existing['seq'], 'replayed':True}
            decisions = []
            for definition,key,value_hash,record,values,source_digest in prepared:
                old = self.db.execute(f'SELECT _revision,_hash FROM "d_{definition["id"]}" WHERE _key=? ORDER BY _revision DESC LIMIT 1', (key,)).fetchone()
                if old and old['_hash'] == value_hash:
                    receipt['duplicates'] += 1
                    continue
                if old and not correction:
                    raise Error('record_conflict', 'Existing observation differs; use explicit correction mode.', dataset=definition['id'])
                revision = old['_revision']+1 if old else 1
                receipt['corrected' if old else 'inserted'] += 1
                decisions.append((definition,key,value_hash,record,values,revision))
            if dry_run:
                return receipt | {'dry_run':True}
            seq = self.db.execute('INSERT INTO ingestions(digest,receipt) VALUES(?,?)', (batch_digest,canonical(receipt))).lastrowid
            for definition,key,value_hash,record,values,revision in decisions:
                fields = list(definition['fields'])
                names = ','.join('"'+f+'"' for f in fields)
                placeholders = ','.join('?' for _ in range(6+len(fields)))
                self.db.execute(f'INSERT INTO "d_{definition["id"]}" (_key,_revision,_seq,_time,_hash,_data,{names}) VALUES({placeholders})',
                                [key,revision,seq,record[definition['time_field']],value_hash,canonical(record),*values])
            self.db.execute('INSERT INTO attempts(digest,outcome) VALUES(?,?)', (batch_digest,'accepted'))
        return receipt | {'seq':seq,'replayed':False}

    def records(self, dataset, seq, as_of):
        identifier(dataset)
        rows = self.db.execute(f'''SELECT _data FROM (
          SELECT _data,_time,_key,ROW_NUMBER() OVER(PARTITION BY _key ORDER BY _revision DESC) AS n
          FROM "d_{dataset}" WHERE _seq<=?) WHERE n=1 AND _time<=? ORDER BY _time,_key LIMIT ?''',
          (seq,as_of,MAX_ROWS+1)).fetchall()
        if len(rows) > MAX_ROWS:
            raise Error('limit_exceeded', 'Snapshot exceeds 100,000 observations; narrow the dataset.')
        return [json.loads(row[0]) for row in rows]

    def dashboard(self, name, revision=None):
        identifier(name)
        if revision is None:
            row = self.db.execute('SELECT * FROM dashboards WHERE id=? ORDER BY revision DESC LIMIT 1',(name,)).fetchone()
        else:
            row = self.db.execute('SELECT * FROM dashboards WHERE id=? AND revision=?',(name,revision)).fetchone()
        if not row:
            raise Error('dashboard_missing', 'Dashboard definition is not registered.')
        return dict(row) | {'definition':json.loads(row['definition'])}
