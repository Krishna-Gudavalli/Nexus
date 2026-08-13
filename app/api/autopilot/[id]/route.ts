
import {NextResponse} from "next/server";
import {getPipeline,upsertPipeline} from "@/lib/autopilot-store";
import {createApprovedPR} from "@/lib/autopilot";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const p=await getPipeline(id);return p?NextResponse.json(p):NextResponse.json({error:"Not found"},{status:404})}
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){
 try{const {id}=await params;const p=await getPipeline(id);if(!p)return NextResponse.json({error:"Not found"},{status:404});const updated=await createApprovedPR(p);await upsertPipeline(updated);return NextResponse.json(updated)}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Approval failed"},{status:400})}
}
