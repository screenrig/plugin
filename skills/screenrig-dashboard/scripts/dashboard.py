#!/usr/bin/env python3
"""Bootstrap the optional dashboard runtime without touching the main CLI."""
import hashlib
import json
import os
from pathlib import Path
import platform
import subprocess
import sys
import venv

sys.dont_write_bytecode = True
SKILL = Path(__file__).resolve().parents[1]
LOCK = SKILL / 'requirements.lock'
digest = hashlib.sha256(LOCK.read_bytes()).hexdigest()[:16]
cache = Path(os.environ.get('XDG_CACHE_HOME', Path.home() / '.cache')) / 'screenrig' / 'dashboard-runtime'
runtime = cache / f'{digest}-{sys.version_info.major}.{sys.version_info.minor}-{sys.platform}-{platform.machine()}'
python = runtime / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
marker = runtime / 'ready.json'


def main():
    if sys.version_info < (3, 11):
        raise RuntimeError('Dashboard authoring requires Python 3.11 or newer.')
    if sys.argv[1:] == ['setup']:
        runtime.mkdir(parents=True, exist_ok=True)
        venv.EnvBuilder(with_pip=True).create(runtime)
        subprocess.run([str(python), '-m', 'pip', 'install', '--disable-pip-version-check',
                        '--only-binary=:all:', '--require-hashes', '-r', str(LOCK)],
                       check=True, stdout=sys.stderr)
        subprocess.run([str(python), '-m', 'playwright', 'install', 'chromium'],
                       check=True, stdout=sys.stderr)
        marker.write_text(json.dumps({'lock': digest}))
        print(json.dumps({'ok': True, 'data': {'runtime': str(runtime), 'lock': digest}}))
        return
    if marker.exists() and Path(sys.prefix).resolve() != runtime.resolve():
        os.execv(str(python), [str(python), '-B', str(Path(__file__).resolve()), *sys.argv[1:]])
    from dashboard_runtime.cli import main as run
    run(SKILL, runtime, marker.exists())


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, OSError, subprocess.CalledProcessError) as exc:
        print(json.dumps({'ok': False, 'error': {'code': 'runtime_missing', 'message': str(exc)},
                          'next': ['screenrig-dashboard', 'setup']}))
        sys.exit(1)
