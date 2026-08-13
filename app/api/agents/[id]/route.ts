import { NextResponse } from "next/server";
import { z } from "zod";
import { getAgents, saveAgents } from "@/lib/store";

const schema = z.object({
  name: z.string().min(2).max(60).optional(),
  description: z.string().max(240).optional(),
  systemPrompt: z.string().min(10).max(4000).optional(),
  tools: z.array(z.enum(["calculator", "current_time", "github_repo", "web_search"])).optional(),
  status: z.enum(["active", "paused"]).optional()
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patch = schema.parse(await req.json());
  const agents = await getAgents();
  const index = agents.findIndex(a => a.id === id);
  if (index < 0) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  agents[index] = { ...agents[index], ...patch, updatedAt: new Date().toISOString() };
  await saveAgents(agents);
  return NextResponse.json(agents[index]);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agents = await getAgents();
  await saveAgents(agents.filter(a => a.id !== id));
  return NextResponse.json({ ok: true });
}
