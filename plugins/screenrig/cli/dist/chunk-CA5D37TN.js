import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import{A as f}from"./chunk-UQFN5NVT.js";var p=new WeakMap;function g(e,t){e.addHelpText("after",`
${t}`),p.set(e,[...p.get(e)??[],t])}function O(e){return[...p.get(e)??[]]}var a=new WeakMap,l=new WeakMap;function h(e,t,o){let i=o.map(r=>{let n=e.options.find(c=>c.long===r);if(!n)throw new Error(`Unknown option ${r}`);return n});a.set(e,[...a.get(e)??[],{kind:t,options:o}]);let u=t==="exactlyOne"?`Provide exactly one of ${o.join(" or ")}.`:t==="atLeastOne"?`Provide at least one of ${o.join(" or ")}.`:t==="atMostOne"?`Provide at most one of ${o.join(" or ")}.`:t==="requires"?`${o[0]} requires ${o.
slice(1).join(" and ")}.`:`Provide ${o.join(" and ")} together.`;g(e,u),e.hook("preAction",()=>{let r=i.filter(s=>e.getOptionValueSource(s.attributeName())==="cli").length,n=s=>e.getOptionValueSource(i[s].attributeName())==="cli";if(t==="exactlyOne"?r!==1:t==="atLeastOne"?r===0:t==="atMostOne"?r>1:t==="requires"?n(0)&&i.slice(1).some((s,x)=>!n(x+1)):r!==0&&r!==i.length)throw f(u)})}function w(e){return a.get(e)??[]}function j(e,...t){l.set(e,[...l.get(e)??[],...t]),e.addHelpText("after",`
Examples:
${t.map(o=>`  ${o}`).join(`
`)}`)}function v(e){return l.get(e)??[]}export{g as a,O as b,h as c,w as d,j as e,v as f};
