import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
function r(s){let d=[],e={},l=0,o=0;for(let c of s.matchAll(/\r\n|\r|\n/g)){let n=s.slice(l,c.index);if(l=c.index+c[0].length,n===""){Object.keys(e).length>0&&d.push(e),e={},o=l;continue}if(n.startsWith(":"))continue;let i=n.indexOf(":"),a=i<0?n:n.slice(0,i),t=i<0?"":n.slice(i+1);t.startsWith(" ")&&(t=t.slice(1)),a==="id"&&!t.includes("\0")?e.id=t:a==="event"?e.event=t:a==="data"&&(e.data=e.data===void 0?t:`${e.data}
${t}`)}return{events:d,rest:s.slice(o)}}export{r as a};
