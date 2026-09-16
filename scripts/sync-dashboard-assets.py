#!/usr/bin/env python3
"""Fetch fixed npm assets, verify registry integrity, and record file digests."""
import base64
import hashlib
import io
import json
from pathlib import Path
import tarfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1] / 'skills/screenrig-dashboard'
PACKAGES = {
    'echarts': ('6.1.0', {'package/dist/echarts.min.js':'echarts.min.js', 'package/LICENSE':'ECHARTS-LICENSE.txt', 'package/NOTICE':'ECHARTS-NOTICE.txt'}),
    '@fontsource/inter': ('5.3.0', {'package/files/inter-latin-400-normal.woff2':'inter-400.woff2', 'package/files/inter-latin-600-normal.woff2':'inter-600.woff2', 'package/LICENSE':'INTER-LICENSE.txt'}),
}


def main():
    lock = {'format':'screenrig.dashboard-dependencies/v1', 'packages':[], 'assets':{}}
    target = ROOT / 'assets/vendor'
    target.mkdir(parents=True, exist_ok=True)
    for name,(version,files) in PACKAGES.items():
        metadata = json.load(urllib.request.urlopen(f'https://registry.npmjs.org/{name}/{version}'))
        dist = metadata['dist']
        archive = urllib.request.urlopen(dist['tarball']).read()
        actual = 'sha512-' + base64.b64encode(hashlib.sha512(archive).digest()).decode()
        if actual != dist['integrity']:
            raise RuntimeError('Package integrity mismatch.')
        with tarfile.open(fileobj=io.BytesIO(archive), mode='r:gz') as tar:
            for member,filename in files.items():
                data = tar.extractfile(member).read()
                if len(data) > 2 * 1024 * 1024:
                    raise RuntimeError('Asset exceeds the plugin per-file budget.')
                (target / filename).write_bytes(data)
                lock['assets'][filename] = hashlib.sha256(data).hexdigest()
        lock['packages'].append({'name':name,'version':version,'url':dist['tarball'],'integrity':actual})
    lock['requirements_sha256'] = hashlib.sha256((ROOT / 'requirements.lock').read_bytes()).hexdigest()
    (ROOT / 'dependencies.lock.json').write_text(json.dumps(lock, indent=2)+'\n')
    print('Dashboard asset sync and integrity checks passed.')


if __name__ == '__main__':
    main()
