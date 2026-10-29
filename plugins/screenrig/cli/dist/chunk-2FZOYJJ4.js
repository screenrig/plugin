import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
var r=new Map([["api.screenrig.ai","screenrig.ai"],["api.stage.screenrig.ai","stage.screenrig.ai"],["api.screenrig.localhost","screenrig.localhost"]]);function i(e){return r.get(e)}export{i as a};
