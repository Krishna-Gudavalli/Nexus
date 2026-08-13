
import { promises as fs } from "fs";
import path from "path";
import { Approval, Memory, Schedule, Integration } from "@/types/ultimate";

const dir = path.join(process.cwd(), "data");
async function read<T>(file: string, fallback: T): Promise<T> {
  await fs.mkdir(dir, { recursive: true });
  try { return JSON.parse(await fs.readFile(path.join(dir,file),"utf8")) as T; }
  catch { await fs.writeFile(path.join(dir,file), JSON.stringify(fallback,null,2)); return fallback; }
}
async function write(file:string, value:unknown) {
  await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,file),JSON.stringify(value,null,2));
}
export const getMemories = () => read<Memory[]>("memories.json",[]);
export const getSchedules = () => read<Schedule[]>("schedules.json",[]);
export const getApprovals = () => read<Approval[]>("approvals.json",[]);
export const getIntegrations = async () => read<Integration[]>("integrations.json",[
  {id:"github",provider:"github",name:"GitHub",status:process.env.GITHUB_TOKEN?"connected":"available"},
  {id:"ai",provider:"openai",name:"AI Provider",status:process.env.AI_API_KEY?"connected":"available"},
  {id:"tavily",provider:"tavily",name:"Tavily Search",status:process.env.TAVILY_API_KEY?"connected":"available"},
  {id:"mcp",provider:"mcp",name:"MCP Gateway",status:"available"}
]);
export const saveMemories=(v:Memory[])=>write("memories.json",v.slice(0,1000));
export const saveSchedules=(v:Schedule[])=>write("schedules.json",v);
export const saveApprovals=(v:Approval[])=>write("approvals.json",v);
