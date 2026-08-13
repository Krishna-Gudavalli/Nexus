import { promises as fs } from "fs"; import path from "path"; import { ModelRoute,Workflow,EvalCase,EvalResult,McpServer,PatchProposal } from "@/types/platform";
const dir=path.join(process.cwd(),"data");
async function read<T>(file:string,fallback:T):Promise<T>{await fs.mkdir(dir,{recursive:true});try{return JSON.parse(await fs.readFile(path.join(dir,file),"utf8"))}catch{await fs.writeFile(path.join(dir,file),JSON.stringify(fallback,null,2));return fallback}}
async function write(file:string,v:unknown){await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,file),JSON.stringify(v,null,2))}
export const getModels=()=>read<ModelRoute[]>("models.json",[
{id:"fast",provider:"openai",model:"gpt-4.1-mini",tier:"fast",costPer1k:.0004,enabled:true},
{id:"balanced",provider:"openai",model:"gpt-4.1-mini",tier:"balanced",costPer1k:.0008,enabled:true},
{id:"reasoning",provider:"openai",model:"gpt-4.1",tier:"reasoning",costPer1k:.004,enabled:true}
]);
export const saveModels=(x:ModelRoute[])=>write("models.json",x);
export const getWorkflows=()=>read<Workflow[]>("workflows.json",[]); export const saveWorkflows=(x:Workflow[])=>write("workflows.json",x);
export const getEvalCases=()=>read<EvalCase[]>("evals.json",[
{id:"security-1",name:"Unsafe secret detection",prompt:"Find the hardcoded API key in this snippet: const key = 'sk-demo-secret';",expectedKeywords:["secret","key"]},
{id:"math-1",name:"Arithmetic",prompt:"Calculate 18 * 7 + 4",expectedKeywords:["130"]}
]);
export const getEvalResults=()=>read<EvalResult[]>("eval-results.json",[]); export const saveEvalResults=(x:EvalResult[])=>write("eval-results.json",x);
export const getMcp=()=>read<McpServer[]>("mcp.json",[]); export const saveMcp=(x:McpServer[])=>write("mcp.json",x);
export const getPatches=()=>read<PatchProposal[]>("patches.json",[]); export const savePatches=(x:PatchProposal[])=>write("patches.json",x);
