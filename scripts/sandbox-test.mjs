
import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const target=process.argv[2]||process.cwd();
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if([".git","node_modules",".next"].includes(ent.name))continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory())walk(p); else files.push(p);
  }
}
walk(target);
const blocked=[];
for(const f of files){
  try{
    const s=fs.readFileSync(f,"utf8");
    if(/rm\s+-rf\s+\/|curl\s+[^|]+\|\s*(sh|bash)|wget\s+[^|]+\|\s*(sh|bash)/i.test(s))
      blocked.push(`${f}: destructive or pipe-to-shell pattern`);
  }catch{}
}
if(blocked.length){console.error(JSON.stringify({passed:false,blocked},null,2));process.exit(2)}
if(process.env.NEXUS_SANDBOX_DOCKER==="true"){
  const r=spawnSync("docker",["run","--rm","--network","none","--cpus","1","--memory","512m","--pids-limit","128","--read-only","node:22-alpine","node","-e","console.log('NEXUS sandbox boot OK')"],{encoding:"utf8"});
  if(r.status!==0){console.error("Docker sandbox unavailable or failed:",r.stderr);process.exit(3)}
}
console.log(JSON.stringify({passed:true,filesScanned:files.length,docker:process.env.NEXUS_SANDBOX_DOCKER==="true"},null,2));
