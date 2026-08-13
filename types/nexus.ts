export type ToolId = "calculator" | "current_time" | "github_repo" | "web_search";

export type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: ToolId[];
  status: "active" | "paused";
  createdAt: string;
  updatedAt: string;
};

export type Run = {
  id: string;
  agentId: string;
  task: string;
  status: "completed" | "failed" | "waiting_approval";
  answer: string;
  createdAt: string;
  durationMs: number;
  steps: RunStep[];
};

export type RunStep = {
  id: string;
  kind: "plan" | "tool" | "result" | "final";
  title: string;
  content: string;
  createdAt: string;
  tool?: ToolId;
};
