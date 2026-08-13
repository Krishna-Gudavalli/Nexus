import { NextResponse } from "next/server";
import { z } from "zod";
import { getAgents, saveAgents } from "@/lib/store";

const schema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(240).default(""),
  systemPrompt: z.string().min(10).max(4000),
  tools: z.array(z.enum(["calculator", "current_time", "github_repo", "web_search"])).default([])
});

export async function GET() {
  return NextResponse.json(await getAgents());
}

export async function POST(req: Request) {
  const body = schema.parse(await req.json());
  const agents = await getAgents();
  const now = new Date().toISOString();
  const agent = {
    id: `agent-${crypto.randomUUID()}`,
    ...body,
    status: "active" as const,
    createdAt: now,
    updatedAt: now
  };
  agents.unshift(agent);
  await saveAgents(agents);
  return NextResponse.json(agent, { status: 201 });
}
