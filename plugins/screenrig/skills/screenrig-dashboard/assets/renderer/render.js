'use strict';
(async () => {
  const spec = await (await fetch('/definition.json')).json();
  const payload = await (await fetch('/payload.json')).json();
  const text = (tag, value, cls) => {const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el;};
  const format = (value, options={}) => {
    if(value===null||value===undefined) return '—';
    if(options.format==='text') return String(value);
    const n=Number(value); if(!Number.isFinite(n)||Math.abs(n)>Number.MAX_SAFE_INTEGER) throw Error('Unsafe numeric display');
    if(options.format==='bytes') {for(const [factor,unit] of [[1e9,'GB'],[1e6,'MB'],[1e3,'KB']]) if(Math.abs(n)>=factor)return (n/factor).toFixed(options.decimals??2)+' '+unit;return n+' B';}
    const s=new Intl.NumberFormat('en-CA',{minimumFractionDigits:options.decimals??0,maximumFractionDigits:options.decimals??0,roundingMode:'halfEven'}).format(n);
    return options.format==='percent'?s+'%':options.format==='usd'?'$'+s:s;
  };
  document.body.classList.toggle('light',spec.theme==='light');
  document.getElementById('title').textContent=spec.title;
  document.getElementById('subtitle').textContent=spec.subtitle;
  document.getElementById('period').textContent=payload.period_label;
  document.getElementById('cutoff').textContent='DATA CUTOFF '+payload.as_of;
  await document.fonts.load('400 16px Inter');await document.fonts.load('600 52px Inter');await document.fonts.ready;
  if(!document.fonts.check('400 16px Inter')||!document.fonts.check('600 52px Inter'))throw Error('Font not loaded');
  const theme=getComputedStyle(document.body),muted=theme.getPropertyValue('--muted').trim(),border=theme.getPropertyValue('--border').trim(),fg=theme.getPropertyValue('--text').trim();
  const charts=[];
  for(const w of spec.widgets){
    const result=payload.queries[w.query],el=text('section','',`widget ${w.type}`);el.id=w.id;
    const [x,y,width,height]=w.rect;Object.assign(el.style,{left:x+'px',top:y+'px',width:width+'px',height:height+'px'});
    el.append(text('h2',w.title));document.getElementById('widgets').append(el);
    const note=w.note_binding?payload.queries[w.note_binding.query].row?.[w.note_binding.field]:(w.note_field?result.row?.[w.note_field]:w.note);
    if(w.type==='metric'){
      el.append(text('div',format(result.row?.[w.field],w),'value'));
      if(note)el.append(text('div',note,'note'));
    } else if(w.type==='notice'){
      el.append(text('div',result.row?.[w.field]??'No data available','message'));
    } else if(w.type==='table'){
      const table=document.createElement('table'),head=document.createElement('tr');
      for(const c of w.columns)head.append(text('th',c.label));table.append(head);
      for(const row of result.rows){const tr=document.createElement('tr');for(const c of w.columns)tr.append(text('td',format(row[c.field],{format:'text',...c})));table.append(tr);}
      el.append(table);if(!result.rows.length)el.append(text('div','No observations','empty'));
      if(note)el.append(text('div',note,'note'));
    } else {
      const box=text('div','','chart');el.append(box);
      const chart=echarts.init(box,null,{renderer:'svg'});charts.push(chart);
      const color=w.color??'#64b5f6';
      const base={animation:false,textStyle:{fontFamily:'Inter',color:fg},tooltip:{show:false},grid:{left:0,right:16,top:12,bottom:20,containLabel:true}};
      if(w.type==='line'){
        const points=result.points;
        chart.setOption({...base,xAxis:{type:'category',data:points.map(p=>p.label),boundaryGap:false,axisLine:{lineStyle:{color:border}},axisTick:{show:false},axisLabel:{color:muted,fontSize:11,interval:2}},
          yAxis:{type:'value',min:w.min??0,...(w.max===undefined?{}:{max:w.max}),minInterval:1,splitNumber:3,splitLine:{lineStyle:{color:border}},axisLabel:{color:muted,fontSize:11}},
          series:[{type:'line',data:points.map(p=>p.value===null?null:Number(p.value)),connectNulls:false,symbol:'circle',symbolSize:6,lineStyle:{width:3,color},itemStyle:{color},areaStyle:{color,opacity:.09},silent:true}]});
        el.append(text('div',note??`${points.length-result.missing} observed buckets · ${result.missing} missing`,'chart-note'));
      } else if(w.type==='bar'){
        const rows=result.rows;
        chart.setOption({...base,grid:{left:120,right:36,top:3,bottom:0,containLabel:false},xAxis:{type:'value',show:false,min:0},
          yAxis:{type:'category',inverse:true,data:rows.map(r=>r[w.label_field]),axisLine:{show:false},axisTick:{show:false},axisLabel:{color:muted,fontSize:13,width:110,overflow:'truncate'}},
          series:[{type:'bar',data:rows.map(r=>r[w.field]===null?null:Number(r[w.field])),barMaxWidth:14,itemStyle:{color,borderRadius:[0,4,4,0]},label:{show:true,position:'right',color:fg,fontSize:13},silent:true}]});
        if(note)el.append(text('div',note,'chart-note'));
      } else if(w.type==='gauge'){
        const value=result.row?.[w.field];
        if(value===null||value===undefined){chart.dispose();box.append(text('div','No observation','empty'));}
        else {if(Number(value)<w.min||Number(value)>w.max)throw Error('Gauge value outside saved bounds');
        chart.setOption({...base,series:[{type:'gauge',min:w.min,max:w.max,startAngle:200,endAngle:-20,progress:{show:true,width:12},axisLine:{lineStyle:{width:12,color:[[1,border]]}},axisTick:{show:false},splitLine:{show:false},axisLabel:{color:muted},pointer:{show:false},detail:{fontSize:34,color:fg,formatter:format(value,w)},data:[{value:Number(value)}],itemStyle:{color},silent:true}]});}
      }
    }
  }
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const issues=[];
  for(const el of document.querySelectorAll('.widget,.message,.value,.note')){
    if(el.scrollHeight>el.clientHeight+2||(!el.matches('.note')&&el.scrollWidth>el.clientWidth+2))issues.push(el.id||el.className);
  }
  if(issues.length)throw Error('Content overflow: '+issues.join(', '));
  window.__dashboardReady={dashboard_id:payload.dashboard_id,revision:payload.revision};
  document.documentElement.dataset.dashboardState='ready';
})().catch(error=>{document.documentElement.dataset.dashboardError=String(error);document.documentElement.dataset.dashboardState='failed';});
