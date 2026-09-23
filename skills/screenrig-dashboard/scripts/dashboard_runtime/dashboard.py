"""Saved query plans and snapshot-bound presentation definitions."""
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import json
from pathlib import Path
import shutil
import zoneinfo

from .store import Error, atomic, canonical, identifier, instant, sha


def zone(name):
    # Always use the locked tzdata wheel, not the host's potentially different database.
    zoneinfo.reset_tzpath([])
    try:
        return zoneinfo.ZoneInfo(name)
    except zoneinfo.ZoneInfoNotFoundError as exc:
        raise Error('invalid_definition', 'Unknown IANA timezone.') from exc


def validate(store, spec, skill):
    from jsonschema import Draft202012Validator
    schema = json.loads((skill / 'schemas/dashboard.json').read_text())
    errors = list(Draft202012Validator(schema).iter_errors(spec))
    if errors:
        raise Error('invalid_definition', errors[0].message, path=list(errors[0].path))
    identifier(spec['id'])
    zone(spec['timezone'])
    for name,q in spec['queries'].items():
        identifier(name)
        dataset = store.dataset(q['dataset'])
        fields = dataset['fields']
        for key in q.get('filter', {}):
            if key not in fields:
                raise Error('invalid_definition', 'Query filter refers to an unknown field.')
        for order in q.get('order_by', []):
            if order['field'] not in fields:
                raise Error('invalid_definition', 'Query order refers to an unknown field.')
        if q['mode'] == 'series':
            field = fields.get(q['field'], {})
            if field.get('type') not in ('decimal','integer'):
                raise Error('invalid_definition', 'Series require a numeric field.')
            if q['aggregate'] == 'sum' and field.get('kind') not in ('period_total','event_count'):
                raise Error('invalid_definition', 'Only totals/events can be summed; snapshots and percentages cannot.')
    ids, rects = set(), []
    for item in spec['widgets']:
        if item['id'] in ids:
            raise Error('invalid_definition', 'Widget IDs must be unique.')
        ids.add(item['id'])
        if item['query'] not in spec['queries']:
            raise Error('invalid_definition', 'Unknown widget query.')
        q = spec['queries'][item['query']]
        fields = store.dataset(q['dataset'])['fields']
        wanted = [item[k] for k in ('field','label_field','note_field') if k in item]
        wanted += [c['field'] for c in item.get('columns', [])]
        if any(f not in fields for f in wanted):
            raise Error('invalid_definition', 'Widget binding refers to an unknown field.')
        if 'note_binding' in item:
            binding=item['note_binding']
            source=spec['queries'].get(binding['query'],{})
            if source.get('mode')!='latest' or binding['field'] not in store.dataset(source['dataset'])['fields']:
                raise Error('invalid_definition','Note binding must name a field in a latest query.')
        required_mode = {'metric':'latest','notice':'latest','gauge':'latest','table':'table','bar':'table','line':'series'}[item['type']]
        if q['mode'] != required_mode:
            raise Error('invalid_definition', 'Widget type and query output are incompatible.')
        if item['type'] in ('metric','notice','gauge','bar') and 'field' not in item:
            raise Error('invalid_definition', 'Widget needs a field binding.')
        if item['type'] == 'bar' and 'label_field' not in item:
            raise Error('invalid_definition', 'Bar needs a category binding.')
        if item['type'] == 'table' and not item.get('columns'):
            raise Error('invalid_definition', 'Table needs declared columns.')
        if item['type'] == 'gauge' and not (item.get('min',0) < item.get('max',0)):
            raise Error('invalid_definition', 'Gauge requires meaningful min/max bounds.')
        x,y,w,h = item['rect']
        if x+w > 1880 or y+h > 1028 or x < 40 or y < 116:
            raise Error('invalid_definition', 'Widget falls outside the reserved canvas area.')
        for a,b,c,d in rects:
            if x<a+c and a<x+w and y<b+d and b<y+h:
                raise Error('invalid_definition', 'Widget rectangles overlap.')
        rects.append((x,y,w,h))


def register(store, spec, skill, revise=False):
    validate(store,spec,skill)
    asset_lock = json.loads((skill / 'dependencies.lock.json').read_text())
    for name,digest in asset_lock['assets'].items():
        if sha((skill / 'assets/vendor' / name).read_bytes()) != digest:
            raise Error('asset_mismatch', 'Packaged asset does not match its digest.')
    fingerprint = {p.relative_to(skill / 'assets').as_posix():sha(p.read_bytes())
                   for p in sorted((skill / 'assets').rglob('*')) if p.is_file()}
    definition_digest = sha({'definition':spec,'assets':fingerprint,'runtime':sha((skill / 'requirements.lock').read_bytes())})
    with store.transaction(True):
        old = store.db.execute('SELECT revision,digest FROM dashboards WHERE id=? ORDER BY revision DESC LIMIT 1',(spec['id'],)).fetchone()
        if old and old['digest'] == definition_digest:
            return {'id':spec['id'],'revision':old['revision'],'created':False}
        if old and not revise:
            raise Error('definition_conflict', 'Dashboard exists. Use an explicit revision for design changes.')
        revision = old['revision']+1 if old else 1
        root = store.root / 'dashboards' / spec['id'] / 'revisions' / str(revision)
        if root.exists():
            # Only an uncommitted staging directory can exist at this unused revision.
            shutil.rmtree(root)
        shutil.copytree(skill / 'assets', root / 'assets')
        atomic(root / 'definition.json', spec)
        atomic(root / 'assets.json',fingerprint)
        atomic(root / 'runtime.json', {'requirements':sha((skill / 'requirements.lock').read_bytes())})
        store.db.execute('INSERT INTO dashboards VALUES(?,?,?,?)',(spec['id'],revision,canonical(spec),definition_digest))
    return {'id':spec['id'],'revision':revision,'created':True}


def numeric(value):
    return Decimal(str(value)) if value is not None else None


def run_query(records, dataset, q, as_of, tz):
    rows = [r for r in records if all(r.get(k) == v for k,v in q.get('filter',{}).items())]
    time = dataset['time_field']
    if q['mode'] == 'latest':
        if not rows:
            return {'mode':'latest','row':None}
        latest = max(r[time] for r in rows)
        candidates = [r for r in rows if r[time] == latest]
        if len(candidates) != 1:
            raise Error('ambiguous_query','Latest metric matches several records; add a dimension filter.')
        return {'mode':'latest','row':candidates[0]}
    if q['mode'] == 'table':
        if rows and q.get('latest_period',True):
            latest = max(r[time] for r in rows)
            rows = [r for r in rows if r[time] == latest]
        rows.sort(key=canonical)
        for order in reversed(q.get('order_by', [])):
            field = order['field']
            is_number = dataset['fields'][field]['type'] in ('decimal','integer')
            if any(r[field] is None for r in rows):
                raise Error('invalid_query','Ordering nullable values requires an explicit non-null field.')
            rows.sort(key=lambda r:numeric(r[field]) if is_number else r[field],reverse=order.get('direction','asc')=='desc')
        limit = q.get('limit',10)
        return {'mode':'table','rows':rows[:limit],'total':len(rows),'omitted':max(0,len(rows)-limit)}
    end = datetime.fromisoformat(as_of.replace('Z','+00:00'))
    interval = q['interval']
    if interval == 'hour':
        end = end.replace(minute=0,second=0,microsecond=0)
        boundaries = [end-timedelta(hours=i) for i in reversed(range(q['count']+1))]
    else:
        end_local = end.astimezone(tz).replace(hour=0,minute=0,second=0,microsecond=0)
        boundaries = [(end_local-timedelta(days=i)).astimezone(timezone.utc) for i in reversed(range(q['count']+1))]
    points=[]
    for start,finish in zip(boundaries,boundaries[1:]):
        values = [r for r in rows if start <= datetime.fromisoformat(r[time].replace('Z','+00:00')) < finish]
        # Distinguish measured zero from absence. Null observations remain missing.
        available=[r for r in values if r[q['field']] is not None]
        if not available:
            value=None
        elif q['aggregate']=='sum':
            value=format(sum((numeric(r[q['field']]) for r in available),Decimal(0)),'f')
        else:
            latest=max(r[time] for r in available)
            chosen=[r for r in available if r[time]==latest]
            if len(chosen)!=1:
                raise Error('ambiguous_query','Latest series bucket needs a dimension filter.')
            value=chosen[0][q['field']]
        points.append({'time':instant(start.isoformat()),'label':start.astimezone(tz).strftime('%H:%M' if interval=='hour' else '%b %d'),
                       'value':value,'status':'missing' if value is None else 'observed'})
    return {'mode':'series','points':points,'missing':sum(p['value'] is None for p in points),
            'unit':dataset['fields'][q['field']].get('unit','')}


def snapshot(store, name, as_of=None, revision=None):
    with store.transaction():
        dashboard=store.dashboard(name,revision)
        spec=dashboard['definition']
        seq=store.db.execute('SELECT COALESCE(MAX(seq),0) FROM ingestions').fetchone()[0]
        datasets={q['dataset']:store.dataset(q['dataset']) for q in spec['queries'].values()}
        if as_of is None:
            endpoints=[store.db.execute(f'SELECT MAX(_time) FROM "d_{name}" WHERE _seq<=?',(seq,)).fetchone()[0] for name in datasets]
            as_of=max((t for t in endpoints if t),default=None)
        if as_of is None:
            raise Error('data_missing','No observations; provide an explicit as-of time for an empty dashboard.')
        as_of=instant(as_of)
        tz=zone(spec['timezone'])
        records={name:store.records(name,seq,as_of) for name in datasets}
        output={name:run_query(records[q['dataset']],datasets[q['dataset']],q,as_of,tz) for name,q in spec['queries'].items()}
        end=datetime.fromisoformat(as_of.replace('Z','+00:00')).astimezone(tz)
        start=end-timedelta(hours=spec.get('window_hours',24))
        payload={'format':'screenrig.dashboard-payload/v1','dashboard_id':name,'revision':dashboard['revision'],
                 'as_of':as_of,'period_label':f'{start:%b %d, %H:%M} – {end:%b %d, %H:%M} · {spec["timezone"]}',
                 'queries':output}
        # Bounds checked before converting exact stored decimals into JS plotting numbers.
        for result in output.values():
            if result['mode']=='series' and any(p['value'] is not None and abs(numeric(p['value'])) > Decimal(2**53-1) for p in result['points']):
                raise Error('limit_exceeded','Series exceeds safe plotting range.')
        digest=sha(payload)
    root=store.root/'dashboards'/name/'snapshots'
    atomic(root/f'{digest}.json',payload)
    metadata={'path':str(root/f'{digest}.json'),'digest':digest,'seq':seq,'revision':dashboard['revision'],
              'as_of':as_of,'dashboard_id':name,'definition_digest':dashboard['digest']}
    atomic(root/f'{digest}.meta.json',metadata)
    return metadata
