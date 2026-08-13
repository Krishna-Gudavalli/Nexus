import { NextResponse } from "next/server";
import { getRuns } from "@/lib/store";
export async function GET(){
 const runs=await getRuns();
 const total=runs.length, completed=runs.filter(r=>r.status==="completed").length;
 const avg=total?Math.round(runs.reduce((n,r)=>n+r.durationMs,0)/total):0;
 return NextResponse.json({total,completed,failed:runs.filter(r=>r.status==="failed").length,successRate:total?Math.round(completed/total*100):100,avgLatencyMs:avg,estimatedTokens:total*850,estimatedCostUsd:Number((total*.0024).toFixed(4)),toolCalls:runs.reduce((n,r)=>n+r.steps.filter(s=>s.kind==="tool").length,0)});
}
