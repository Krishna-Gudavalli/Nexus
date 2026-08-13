#!/usr/bin/env node
const base=process.env.NEXUS_URL||"http://localhost:3000";const [, ,cmd,...rest]=process.argv;
const task=rest.join(" ");
if(!cmd){console.log("NEXUS CLI\n\nUsage: node cli/nexus.mjs run <task>\n       node cli/nexus.mjs orchestrate <task>\n       node cli/nexus.mjs security <source>");process.exit(0)}
const post=async(path,body)=>{const r=await fetch(base+path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});console.log(await r.text())};
if(cmd==="orchestrate")await post("/api/orchestrate",{task});else if(cmd==="security")await post("/api/security",{source:task});else if(cmd==="run"){const a=await fetch(base+"/api/agents").then(r=>r.json());if(!a[0])throw new Error("No agent configured");const r=await fetch(base+`/api/agents/${a[0].id}/run`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({task})});console.log(await r.text())}else console.log("Unknown command");
