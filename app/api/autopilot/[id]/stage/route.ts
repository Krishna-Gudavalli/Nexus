import {NextResponse} from "next/server";
import {getPipeline,upsertPipeline} from "@/lib/autopilot-store";
import {runPipelineStage} from "@/lib/autopilot";
import {z} from "zod";
const schema=z.object({stage:z.enum(["github_fetch","security_scan","patch_generation","sandbox_validation"])});
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 try{const {id}=await params;const p=await getPipeline(id);if(!p)return NextResponse.json({error:"Not found"},{status:404});const b=schema.parse(await req.json());const updated=await runPipelineStage(p,b.stage);await upsertPipeline(updated);return NextResponse.json(updated,{status:updated.stage==="failed"?400:200});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Stage failed"},{status:400})}
}
