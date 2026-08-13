import { NextResponse } from "next/server"; import { z } from "zod"; import { runAutonomous } from "@/lib/orchestrator";
const schema=z.object({task:z.string().min(3).max(12000)});export async function POST(req:Request){try{return NextResponse.json(await runAutonomous(schema.parse(await req.json()).task))}catch(e){return NextResponse.json({error:(e as Error).message},{status:500})}}
