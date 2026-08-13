import { NextResponse } from "next/server";
import { z } from "zod";
import { getMemories, saveMemories } from "@/lib/ultimate-store";
const schema=z.object({agentId:z.string(),content:z.string().min(1),tags:z.array(z.string()).default([]),importance:z.number().min(0).max(1).default(.5)});
export async function GET(){return NextResponse.json(await getMemories())}
export async function POST(req:Request){const b=schema.parse(await req.json());const all=await getMemories();const m={id:crypto.randomUUID(),...b,createdAt:new Date().toISOString()};all.unshift(m);await saveMemories(all);return NextResponse.json(m,{status:201})}
