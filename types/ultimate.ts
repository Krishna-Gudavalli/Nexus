
export type AgentRole = "orchestrator" | "researcher" | "developer" | "security" | "reviewer" | "custom";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type TaskStatus = "queued" | "running" | "completed" | "failed" | "waiting_approval";

export type Memory = {
  id: string;
  agentId: string;
  content: string;
  tags: string[];
  importance: number;
  createdAt: string;
};

export type Schedule = {
  id: string;
  agentId: string;
  cron: string;
  prompt: string;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
};

export type Approval = {
  id: string;
  runId: string;
  action: string;
  target: string;
  reason: string;
  status: ApprovalStatus;
  createdAt: string;
  resolvedAt?: string;
};

export type Integration = {
  id: string;
  provider: "github" | "mcp" | "openai" | "gemini" | "tavily";
  name: string;
  status: "connected" | "available" | "error";
  metadata?: Record<string, string>;
};
