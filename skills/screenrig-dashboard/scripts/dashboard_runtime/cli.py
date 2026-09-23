"""Small local CLI; business data never enters the plugin distribution."""
import argparse
import json
from pathlib import Path
import sqlite3
import sys

from .store import Error, Store, default_home, load


def parser():
    p=argparse.ArgumentParser(prog='screenrig-dashboard')
    p.add_argument('--workspace',default=str(default_home()))
    sub=p.add_subparsers(dest='command',required=True)
    sub.add_parser('doctor')
    sub.add_parser('commands')
    for kind in ('datasets','dashboards'):
        family=sub.add_parser(kind).add_subparsers(dest='action',required=True)
        listing=family.add_parser('list');listing.add_argument('--search',default='')
        show=family.add_parser('show');show.add_argument('id')
        register=family.add_parser('register');register.add_argument('file')
        if kind=='dashboards':
            revise=family.add_parser('revise');revise.add_argument('file')
    ingest=sub.add_parser('ingest');ingest.add_argument('--batch',required=True)
    ingest.add_argument('--correct',action='store_true');ingest.add_argument('--dry-run',action='store_true')
    for name in ('snapshot','render','refresh'):
        cmd=sub.add_parser(name);cmd.add_argument('--dashboard',required=True)
        cmd.add_argument('--as-of');cmd.add_argument('--revision',type=int)
        if name=='render':cmd.add_argument('--snapshot')
        if name=='refresh':cmd.add_argument('--batch',required=True);cmd.add_argument('--correct',action='store_true')
    runs=sub.add_parser('runs');runs.add_argument('--dashboard',required=True)
    return p


def main(skill,runtime,ready):
    args=parser().parse_args();accepted=None
    try:
        if args.command=='doctor':
            data={'runtime_ready':ready,'runtime':str(runtime),'sqlite':sqlite3.sqlite_version,
                  'workspace':str(Path(args.workspace).expanduser().resolve()),
                  'next':None if ready else ['screenrig-dashboard','setup']}
        elif args.command=='commands':
            data={'commands':['doctor','setup','commands','datasets list','datasets show','datasets register',
                              'dashboards list','dashboards show','dashboards register','dashboards revise',
                              'ingest','snapshot','render','refresh','runs']}
        else:
            if not ready:
                raise Error('runtime_missing','Run screenrig-dashboard setup first.')
            from . import dashboard
            store=Store(args.workspace)
            if args.command=='datasets':
                if args.action=='list':data=store.list_datasets(args.search)
                elif args.action=='show':data=store.dataset(args.id)
                else:data=store.register(load(args.file))
            elif args.command=='dashboards':
                if args.action=='list':
                    data=[dict(r) for r in store.db.execute('SELECT id,MAX(revision) AS revision FROM dashboards GROUP BY id ORDER BY id')]
                elif args.action=='show':data=store.dashboard(args.id)
                else:data=dashboard.register(store,load(args.file),skill,args.action=='revise')
            elif args.command=='ingest':
                data=store.ingest(load(args.batch),Path(args.batch).resolve().parent,args.correct,args.dry_run)
            elif args.command=='runs':
                data=[json.loads(r[0]) for r in store.db.execute('SELECT result FROM runs WHERE dashboard=? ORDER BY rowid DESC LIMIT 30',(args.dashboard,))]
            else:
                if args.command=='refresh':
                    accepted=store.ingest(load(args.batch),Path(args.batch).resolve().parent,args.correct)
                if args.command=='render' and args.snapshot:
                    metadata=load(args.snapshot)
                    if metadata['dashboard_id']!=args.dashboard:
                        raise Error('snapshot_mismatch','Snapshot belongs to another dashboard.')
                else:
                    metadata=dashboard.snapshot(store,args.dashboard,args.as_of,args.revision)
                if args.command=='snapshot':data=metadata
                else:
                    from .render import render
                    data=render(store,metadata,skill)
                    if accepted is not None:data['ingestion']=accepted
            store.db.close()
        print(json.dumps({'ok':True,'data':data},ensure_ascii=False,allow_nan=False))
    except (Error,ValueError,KeyError,TypeError,OSError,sqlite3.Error,RecursionError) as exc:
        code=exc.code if isinstance(exc,Error) else 'invalid_input'
        result={'ok':False,'error':{'code':code,'message':str(exc),'details':getattr(exc,'details',{})}}
        if accepted is not None:result['ingestion']=accepted
        if code=='runtime_missing':result['next']=['screenrig-dashboard','setup']
        print(json.dumps(result,ensure_ascii=False))
        sys.exit(1)
