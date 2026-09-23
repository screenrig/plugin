#!/usr/bin/env python3
"""Behavior checks on synthetic data; opt into real browser checks with --browser."""
from copy import deepcopy
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
SKILL=ROOT/'skills/screenrig-dashboard'
sys.path.insert(0,str(SKILL/'scripts'))
sys.dont_write_bytecode=True
from dashboard_runtime.store import Error, Store, atomic, sha
from dashboard_runtime import dashboard

BROWSER='--browser' in sys.argv
if BROWSER:sys.argv.remove('--browser')
SCHEMA={'id':'test-metrics','description':'Synthetic measured hourly counts','grain':'One item per hour',
        'key':['observed'],'time_field':'observed','fields':{
            'observed':{'type':'timestamp'},'count':{'type':'integer','minimum':0,'kind':'period_total'},
            'money':{'type':'decimal','scale':2,'unit':'CAD','nullable':True}}}
ROWS=[{'observed':'2026-01-01T00:00:00Z','count':0,'money':'0.10'},
      {'observed':'2026-01-01T01:00:00Z','count':4,'money':None}]


class DashboardTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
        self.store=Store(self.root/'state');self.store.register(deepcopy(SCHEMA))
        self.input=self.root/'input.json';atomic(self.input,ROWS)
        self.batch={'inputs':[{'dataset':'test-metrics','path':str(self.input)}]}

    def tearDown(self):
        self.store.db.close();self.temp.cleanup()

    def ingest(self,rows=None,**kwargs):
        if rows is not None:atomic(self.input,rows)
        return self.store.ingest(self.batch,self.root,**kwargs)

    def spec(self):
        return {'id':'test-board','title':'Test metrics','subtitle':'Synthetic fixture','timezone':'UTC',
          'queries':{'latest':{'dataset':'test-metrics','mode':'latest'},
                     'hours':{'dataset':'test-metrics','mode':'series','field':'count','interval':'hour','count':4,'aggregate':'sum'}},
          'widgets':[{'id':'total','type':'metric','title':'Latest count','query':'latest','field':'count','rect':[40,116,400,170]},
                     {'id':'trend','type':'line','title':'Hourly observations','query':'hours','rect':[40,310,1000,350]}]}

    def test_retry_and_cross_format_duplicate(self):
        first=self.ingest();again=self.ingest()
        self.assertEqual(first['inserted'],2);self.assertEqual(again['duplicates'],2)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM "d_test-metrics"').fetchone()[0],2)
        file=self.root/'input.csv';file.write_text('observed,count,money\n2026-01-01T00:00:00Z,0,0.10\n')
        result=self.store.ingest({'inputs':[{'dataset':'test-metrics','path':str(file)}]},self.root)
        self.assertEqual(result['duplicates'],1)

    def test_correction_preserves_snapshot(self):
        initial=self.ingest()
        changed=deepcopy(ROWS);changed[1]['count']=9
        with self.assertRaises(Error):self.ingest(changed)
        result=self.ingest(changed,correction=True)
        self.assertEqual(result['corrected'],1)
        old=self.store.records('test-metrics',initial['seq'],'2026-01-02T00:00:00.000Z')
        new=self.store.records('test-metrics',result['seq'],'2026-01-02T00:00:00.000Z')
        self.assertEqual(old[-1]['count'],4);self.assertEqual(new[-1]['count'],9)

    def test_invalid_batch_is_atomic(self):
        rows=deepcopy(ROWS);rows[1]['count']=-2
        with self.assertRaises(Error):self.ingest(rows)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM ingestions').fetchone()[0],0)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM "d_test-metrics"').fetchone()[0],0)

    def test_decimal_is_exact_and_excess_precision_rejected(self):
        self.ingest()
        self.assertEqual(self.store.db.execute('SELECT money FROM "d_test-metrics" WHERE money IS NOT NULL').fetchone()[0],10)
        rows=deepcopy(ROWS);rows[0]['money']='0.105'
        with self.assertRaises(Error):self.ingest(rows,correction=True)

    def test_unknown_field_and_ambiguous_time_rejected(self):
        for record in [ROWS[0]|{'extra':1},ROWS[0]|{'observed':'2026-01-01T00:00:00'}]:
            with self.assertRaises(Error):self.ingest([record])

    def test_duplicate_keys_inside_batch(self):
        self.assertEqual(self.ingest([ROWS[0],ROWS[0]])['inserted'],1)
        with self.assertRaises(Error):self.ingest([ROWS[0],ROWS[0]|{'count':7}])

    def test_definition_reuse_and_drift_rejection(self):
        self.assertFalse(self.store.register(SCHEMA)['created'])
        changed=deepcopy(SCHEMA);changed['fields']['count']['unit']='different'
        with self.assertRaises(Error):self.store.register(changed)
        changed['id']='bad"; DROP TABLE datasets;'
        with self.assertRaises(Error):self.store.register(changed)

    def test_snapshot_gaps_and_consistent_replay(self):
        self.ingest();dashboard.register(self.store,self.spec(),SKILL)
        first=dashboard.snapshot(self.store,'test-board','2026-01-01T04:00:00Z')
        again=dashboard.snapshot(self.store,'test-board','2026-01-01T04:00:00Z')
        self.assertEqual(first['digest'],again['digest'])
        payload=json.loads(Path(first['path']).read_text())
        self.assertEqual([p['value'] for p in payload['queries']['hours']['points']],['0','4',None,None])
        self.assertEqual(payload['queries']['latest']['row']['count'],4)

    def test_schema_rejects_overlap_and_invalid_binding(self):
        s=self.spec();s['widgets'][1]['rect']=[40,120,400,200]
        with self.assertRaises(Error):dashboard.register(self.store,s,SKILL)
        s=self.spec();s['widgets'][0]['field']='absent'
        with self.assertRaises(Error):dashboard.register(self.store,s,SKILL)

    def test_snapshot_metric_cannot_be_summed(self):
        s=deepcopy(SCHEMA);s['id']='snapshot';s['fields']['count']['kind']='snapshot'
        self.store.register(s)
        spec=self.spec();spec['queries']['hours']['dataset']='snapshot'
        with self.assertRaises(Error):dashboard.register(self.store,spec,SKILL)

    def test_fresh_process_registry(self):
        self.ingest();other=Store(self.root/'state')
        self.assertEqual(other.list_datasets('hourly')[0]['id'],'test-metrics');other.db.close()

    def test_day_buckets_follow_dst(self):
        q={'mode':'series','field':'count','interval':'day','count':3,'aggregate':'sum'}
        result=dashboard.run_query([],SCHEMA,q,'2026-03-10T07:00:00.000Z',dashboard.zone('America/Los_Angeles'))
        self.assertEqual([p['time'] for p in result['points']],
                         ['2026-03-07T08:00:00.000Z','2026-03-08T08:00:00.000Z','2026-03-09T07:00:00.000Z'])

    @unittest.skipUnless(BROWSER,'use --browser for real Chromium')
    def test_real_browser_repeat_and_failed_render_preserves_latest(self):
        from dashboard_runtime.render import render,webp_dimensions
        self.ingest();dashboard.register(self.store,self.spec(),SKILL)
        meta=dashboard.snapshot(self.store,'test-board','2026-01-01T04:00:00Z')
        a=render(self.store,meta,SKILL);b=render(self.store,meta,SKILL)
        self.assertEqual(a['pixel_sha256'],b['pixel_sha256']);self.assertEqual(a['sha256'],b['sha256'])
        self.assertEqual(webp_dimensions(Path(a['image']).read_bytes()),(3840,2160))
        latest=(self.store.root/'dashboards/test-board/latest.json').read_bytes()
        self.ingest([{'observed':'2025-12-31T00:00:00Z','count':2,'money':None}])
        historical=dashboard.snapshot(self.store,'test-board','2026-01-01T02:00:00Z')
        replay=render(self.store,historical,SKILL)
        self.assertFalse(replay['promoted'])
        self.assertEqual((self.store.root/'dashboards/test-board/latest.json').read_bytes(),latest)
        asset=self.store.root/'dashboards/test-board/revisions/1/assets/vendor/inter-400.woff2'
        asset.write_bytes(b'bad font')
        with self.assertRaises(Error):render(self.store,meta,SKILL)
        self.assertEqual((self.store.root/'dashboards/test-board/latest.json').read_bytes(),latest)


if __name__=='__main__':unittest.main()
