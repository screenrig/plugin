"""Render saved assets offline and promote only verified complete output."""
import base64
from datetime import datetime, timezone
import hashlib
import importlib.metadata
import json
import mimetypes
import os
from pathlib import Path
import platform
import time
import uuid
from urllib.parse import urlparse

from .store import Error, atomic, canonical, load, sha


def webp_dimensions(data):
    if data[:4]!=b'RIFF' or data[8:12]!=b'WEBP' or int.from_bytes(data[4:8],'little')+8!=len(data):
        raise Error('render_failed','Invalid WebP container.')
    offset=12;dimensions=None
    while offset+8<=len(data):
        kind=data[offset:offset+4];size=int.from_bytes(data[offset+4:offset+8],'little')
        part=data[offset+8:offset+8+size]
        if len(part)!=size or kind in (b'VP8L',b'ANIM',b'ANMF'):
            raise Error('render_failed','Expected single-frame lossy WebP.')
        if kind==b'VP8 ' and len(part)>=10 and part[3:6]==b'\x9d\x01\x2a':
            dimensions=(int.from_bytes(part[6:8],'little')&0x3fff,int.from_bytes(part[8:10],'little')&0x3fff)
        offset+=8+size+(size%2)
    if dimensions!=(3840,2160):
        raise Error('render_failed','Expected an encoded 3840 × 2160 WebP frame.')
    return dimensions


def render(store, metadata, skill):
    from playwright.sync_api import sync_playwright
    payload=load(metadata['path'])
    if sha(payload)!=metadata['digest']:
        raise Error('snapshot_mismatch','Saved snapshot digest differs.')
    name=payload['dashboard_id'];revision=payload['revision']
    dashboard=store.dashboard(name,revision)
    if dashboard['digest']!=metadata['definition_digest']:
        raise Error('definition_conflict','Snapshot presentation differs.')
    root=store.root/'dashboards'/name
    presentation=root/'revisions'/str(revision)
    if load(presentation/'runtime.json')['requirements']!=sha((skill/'requirements.lock').read_bytes()):
        raise Error('definition_incompatible','Presentation needs its original dependency lock/runtime.')
    for relative,digest in load(presentation/'assets.json').items():
        if sha((presentation/'assets'/relative).read_bytes())!=digest:
            raise Error('asset_mismatch','Saved presentation was modified.')
    # Short exclusive OS lock directory. Never steal a lock from a running renderer.
    lease=root/'render.lock'
    try:
        lease.mkdir()
    except FileExistsError as exc:
        raise Error('workspace_busy','Another render holds the dashboard lock. Inspect its owner before removing a stale lock.') from exc
    atomic(lease/'owner.json',{'pid':os.getpid(),'started_at':datetime.now(timezone.utc).isoformat()})
    run_id=uuid.uuid4().hex
    run=root/'runs'/run_id
    run.mkdir(parents=True)
    result={'id':run_id,'dashboard_id':name,'revision':revision,'seq':metadata['seq'],
            'snapshot_digest':metadata['digest'],'presentation_digest':dashboard['digest'],'as_of':payload['as_of']}
    started=time.monotonic()
    try:
        assets={('/assets/'+p.relative_to(presentation/'assets').as_posix()):p.read_bytes() for p in (presentation/'assets').rglob('*') if p.is_file()}
        assets.update({'/':(presentation/'assets/renderer/index.html').read_bytes(),
                       '/definition.json':canonical(dashboard['definition']).encode(),'/payload.json':canonical(payload).encode()})
        errors=[]
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True,chromium_sandbox=True)
            context=browser.new_context(viewport={'width':1920,'height':1080},device_scale_factor=2,
                locale='en-CA',timezone_id=dashboard['definition']['timezone'],color_scheme='dark',
                reduced_motion='reduce',service_workers='block')
            def route(request):
                url=urlparse(request.request.url)
                if url.scheme=='https' and url.netloc=='dashboard.invalid' and url.path in assets:
                    mime=mimetypes.guess_type(url.path)[0] or ('text/html' if url.path=='/' else 'application/octet-stream')
                    request.fulfill(status=200,body=assets[url.path],content_type=mime)
                else:
                    errors.append('Unexpected resource request')
                    request.abort()
            context.route('**/*',route)
            page=context.new_page()
            page.set_default_timeout(30000)
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.clock.set_fixed_time(datetime.fromisoformat(payload['as_of'].replace('Z','+00:00')))
            page.add_init_script('Math.random = () => 0.5;')
            page.goto('https://dashboard.invalid/',wait_until='load')
            page.locator('html[data-dashboard-state]').wait_for(state='attached')
            page_error=page.locator('html').get_attribute('data-dashboard-error')
            if errors or page_error:
                raise Error('render_failed',str(page_error or errors[0]))
            image=page.screenshot(type='webp',quality=90,scale='device',animations='disabled')
            webp_dimensions(image)
            # Hash actual decoded pixels using the same locked browser decoder.
            decoded=page.evaluate('''async encoded => {
              const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
              const bitmap=await createImageBitmap(new Blob([bytes],{type:'image/webp'}));
              const canvas=new OffscreenCanvas(bitmap.width,bitmap.height),ctx=canvas.getContext('2d');
              ctx.drawImage(bitmap,0,0);
              const digest=await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,bitmap.width,bitmap.height).data);
              return {width:bitmap.width,height:bitmap.height,pixel_sha256:Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('')};
            }''',base64.b64encode(image).decode())
            result.update(decoded)
            result['runtime']={'browser':browser.version,'playwright':importlib.metadata.version('playwright'),
                               'tzdata':importlib.metadata.version('tzdata'),'os':platform.platform(),
                               'requirements_sha256':sha((skill/'requirements.lock').read_bytes()),'quality':90}
            browser.close()
        atomic(run/'dashboard.webp',image)
        atomic(run/'payload.json',payload)
        result.update({'status':'complete','image':str(run/'dashboard.webp'),'content_type':'image/webp',
                       'sha256':sha(image),'bytes':len(image),'elapsed_seconds':round(time.monotonic()-started,3),
                       'created_at':datetime.now(timezone.utc).isoformat(),'promoted':False})
        with store.transaction(True):
            latest=root/'latest.json'
            old=load(latest) if latest.exists() else {}
            # Older snapshots and historical replays cannot displace more recent output.
            promote=(metadata['seq']>=old.get('seq',-1)
                     and payload['as_of']>=old.get('as_of','')
                     and revision>=old.get('revision',0))
            result['promoted']=promote
            atomic(run/'result.json',result)
            store.db.execute('INSERT INTO runs VALUES(?,?,?,?,?,?)',(run_id,name,revision,metadata['seq'],'complete',canonical(result)))
        if promote:
            atomic(root/'latest.json',result)
        return result
    except Exception as exc:
        result.update({'status':'failed','error':str(exc),'promoted':False})
        atomic(run/'result.json',result)
        store.db.execute('INSERT OR REPLACE INTO runs VALUES(?,?,?,?,?,?)',(run_id,name,revision,metadata['seq'],'failed',canonical(result)))
        if isinstance(exc,Error):
            raise
        raise Error('render_failed',str(exc),run_id=run_id) from exc
    finally:
        (lease/'owner.json').unlink(missing_ok=True)
        lease.rmdir()
