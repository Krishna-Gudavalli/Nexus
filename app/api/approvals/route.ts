import { NextResponse } from "next/server";
import { z } from "zod";
import { getApprovals, saveApprovals } from "@/lib/ultimate-store";
const schema=z.object({id:z.string(),status:z.enum(["approved","rejected"])});
export async function GET(){return NextResponse.json(await getApprovals())}
export async function PATCH(req:Request){const b=schema.parse(await req.json());const all=await getApprovals();const i=all.findIndex(x=>x.id===b.id);if(i<0)return NextResponse.json({error:"Approval not found"},{status:404});all[i]={...all[i],status:b.status,resolvedAt:new Date().toISOString()};await saveApprovals(all);return NextResponse.json(all[i])}
