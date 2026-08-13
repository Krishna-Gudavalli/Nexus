
import { promises as fs } from "fs";
import path from "path";
import { Pipeline } from "@/types/autopilot";

const dir=path.join(process.cwd(),"data");
async function read<T>(file:string,fallback:T):Promise<T>{
  await fs.mkdir(dir,{recursive:true});
  try{return JSON.parse(await fs.readFile(path.join(dir,file),"utf8")) as T}
  catch{await fs.writeFile(path.join(dir,file),JSON.stringify(fallback,null,2));return fallback}
}
async function write(file:string,v:unknown){await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,file),JSON.stringify(v,null,2))}
export const getPipelines=()=>read<Pipeline[]>("autopilot-pipelines.json",[]);
export const savePipelines=(v:Pipeline[])=>write("autopilot-pipelines.json",v.slice(0,200));
export async function getPipeline(id:string){return (await getPipelines()).find(x=>x.id===id)}
export async function upsertPipeline(p:Pipeline){const all=await getPipelines();const i=all.findIndex(x=>x.id===p.id);if(i>=0)all[i]=p;else all.unshift(p);await savePipelines(all);return p}
