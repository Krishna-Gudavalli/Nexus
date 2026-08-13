
import { NextResponse } from "next/server";
import { z } from "zod";
import { startPipeline } from "@/lib/autopilot";
import { getPipelines, savePipelines } from "@/lib/autopilot-store";
const schema=z.object({owner:z.string().regex(/^[A-Za-z0-9_.-]+$/),repo:z.string().regex(/^[A-Za-z0-9_.-]+$/),task:z.string().min(5).max(1000)});
export async function GET(){return NextResponse.json(await getPipelines())}
export async function POST(req:Request){
 try{
  const b=schema.parse(await req.json()); const p=await startPipeline(b.owner,b.repo,b.task); const all=await getPipelines(); await savePipelines([p,...all]); return NextResponse.json(p,{status:p.status==="failed"?400:201});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid request"},{status:400})}
}
