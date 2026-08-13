
export type PipelineStage =
  | "queued" | "github_fetch" | "security_scan" | "patch_generation"
  | "sandbox_validation" | "approval" | "pr_creation" | "completed" | "failed";

export type Pipeline = {
  id: string;
  owner: string;
  repo: string;
  baseBranch: string;
  task: string;
  stage: PipelineStage;
  status: "running" | "waiting_approval" | "completed" | "failed";
  score: number;
  riskLevel?: "CLEAN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  autonomyPolicy?: { mode: string; approval: string; message: string };
  findings: any[];
  changes: {path:string; before:string; after:string; reasons:string[]}[];
  sandbox: {passed:boolean; mode:"static"|"docker"; checks:string[]; blocked:string[]};
  approvalId?: string;
  pullRequest?: {number:number; url:string; branch:string};
  logs: {at:string;stage:PipelineStage;message:string}[];
  stageStates?: Partial<Record<PipelineStage, "idle" | "running" | "success" | "failed">>;
  stageDetails?: Partial<Record<PipelineStage, string>>;
  createdAt: string;
  updatedAt: string;
};
