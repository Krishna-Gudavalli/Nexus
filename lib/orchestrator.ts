import { Agent } from "@/types/nexus";
import { getAgents } from "@/lib/store";
import { generateAnswer, chooseTools } from "@/lib/ai";
import { executeTool } from "@/lib/tools";
import { getAgentDisplayName } from "@/lib/agent-roles";

export type AgentResult={agentId:string;agent:string;answer:string;tools:string[];durationMs:number};

function score(agent:Agent,task:string){
  const t=task.toLowerCase();
  const role=getAgentDisplayName(agent).toLowerCase();
  let s=0;
  if(/security|vulnerab|cve|secret|auth|exploit/.test(t)&&role.includes("security"))s+=8;
  if(/github|repo|code|pull request|architecture|implementation|fix|patch/.test(t)&&role.includes("fixer"))s+=6;
  if(/research|latest|compare|find|investigate|documentation/.test(t)&&role.includes("researcher"))s+=8;
  return s;
}

export async function runAutonomous(task:string){
  const agents=(await getAgents()).filter(a=>a.status==="active");
  const selected=agents.sort((a,b)=>score(b,task)-score(a,task)).slice(0,Math.min(3,agents.length));
  const results:AgentResult[]=[];
  for(const agent of selected){
    const started=Date.now();
    const chosen=chooseTools(task,agent.tools);
    const outputs:string[]=[];
    for(const c of chosen){try{outputs.push(`${c.tool}: ${await executeTool(c.tool,c.input)}`)}catch(e){outputs.push(`${c.tool}: ERROR ${(e as Error).message}`)}}
    const displayName=getAgentDisplayName(agent);
    const answer=await generateAnswer(agent.systemPrompt,task,outputs,displayName);
    results.push({agentId:agent.id,agent:displayName,answer,tools:chosen.map(x=>x.tool),durationMs:Date.now()-started});
  }
  const synthesis=results.map(r=>`### ${r.agent}\n${r.answer}`).join("\n\n");
  const final=await generateAnswer("You are the NEXUS synthesis reviewer. Combine specialist findings, resolve contradictions, clearly label uncertainty and never claim writes occurred.",task,[synthesis],"NEXUS Synthesis AI");
  return {selected:results,final};
}
