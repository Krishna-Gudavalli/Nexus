export type ModelRoute = { id:string; provider:string; model:string; tier:"fast"|"balanced"|"reasoning"; costPer1k:number; enabled:boolean };
export type SecurityFinding = { id:string; severity:"critical"|"high"|"medium"|"low"; title:string; file:string; line?:number; evidence:string; remediation:string; category:string; groupKey:string; confidence:number; cwe?:string; owasp?:string };
export type PatchProposal = { id:string; findingId:string; file:string; summary:string; diff:string; safe:boolean; status:"draft"|"validated"|"rejected"|"approved" };
export type WorkflowNode = { id:string; type:"trigger"|"agent"|"tool"|"condition"|"approval"|"output"; label:string; config?:Record<string,unknown> };
export type Workflow = { id:string; name:string; description:string; nodes:WorkflowNode[]; enabled:boolean; createdAt:string };
export type EvalCase = { id:string; name:string; prompt:string; expectedKeywords:string[]; agentId?:string };
export type EvalResult = { caseId:string; passed:boolean; score:number; output:string; latencyMs:number; notes:string };
export type McpServer = { id:string; name:string; url:string; status:"configured"|"disabled"; tools:string[] };
