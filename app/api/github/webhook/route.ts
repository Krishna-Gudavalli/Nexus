import {NextResponse} from "next/server";
import crypto from "crypto";
export async function POST(req:Request){
 const raw=await req.text(); const secret=process.env.GITHUB_WEBHOOK_SECRET;
 if(secret){
   const sig=req.headers.get("x-hub-signature-256")||"";
   const expected="sha256="+crypto.createHmac("sha256",secret).update(raw).digest("hex");
   const a=Buffer.from(sig),b=Buffer.from(expected);
   if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return NextResponse.json({error:"Invalid signature"},{status:401});
 }
 const event=req.headers.get("x-github-event")||"unknown";
 let body:any={};try{body=JSON.parse(raw)}catch{}
 return NextResponse.json({accepted:true,event,action:body.action||null,repository:body.repository?.full_name||null});
}
