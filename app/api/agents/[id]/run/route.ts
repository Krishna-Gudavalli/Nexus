import { NextResponse } from "next/server";
import { z } from "zod";
import { getAgents, getRuns, saveRuns } from "@/lib/store";
import { chooseTools, generateAnswer } from "@/lib/ai";
import { executeTool } from "@/lib/tools";
import { getAgentRole } from "@/lib/agent-roles";

const schema = z.object({ task: z.string().min(2).max(12000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { task } = schema.parse(body);
    const agents = await getAgents();
    const agent = agents.find((a) => a.id === id);
    if (!agent) return NextResponse.json({ ok: false, error: "Agent not found" }, { status: 404 });

    const started = Date.now();
    const steps: any[] = [{
      id: crypto.randomUUID(), kind: "plan", title: "Plan",
      content: `Selected ${agent.name}; inspecting enabled tools.`,
      createdAt: new Date().toISOString()
    }];
    const outputs: string[] = [];

    for (const c of chooseTools(task, agent.tools)) {
      try {
        const out = await executeTool(c.tool, c.input);
        outputs.push(`${c.tool}: ${out}`);
        steps.push({ id: crypto.randomUUID(), kind: "tool", title: c.tool,
          content: String(out).slice(0, 6000), createdAt: new Date().toISOString(), tool: c.tool });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Tool execution failed";
        steps.push({ id: crypto.randomUUID(), kind: "result", title: `${c.tool} failed`,
          content: message, createdAt: new Date().toISOString(), tool: c.tool });
      }
    }

    const answer = await generateAnswer(agent.systemPrompt, task, outputs, agent.name);
    steps.push({ id: crypto.randomUUID(), kind: "final", title: "Final response",
      content: answer, createdAt: new Date().toISOString() });

    const run = { id: `run-${crypto.randomUUID()}`, agentId: id, task,
      status: "completed" as const, answer, createdAt: new Date().toISOString(),
      durationMs: Date.now() - started, steps };
    const runs = await getRuns();
    await saveRuns([run, ...runs]);
    const role = getAgentRole(agent);
    return NextResponse.json({ ok: true, ...run, agentRole: role.role, agentLabel: role.label, agentPurpose: role.shortPurpose });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent execution failed";
    console.error("NEXUS agent run failed:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
