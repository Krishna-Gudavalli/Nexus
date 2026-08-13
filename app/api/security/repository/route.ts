import { NextResponse } from "next/server";
import { z } from "zod";
import { repoInfo, repoTree, fileContent } from "@/lib/github-api";
import { classifyRisk, scanDockerfile, scanPackageJson, scanText, scoreFindings, autonomyPolicy, groupFindings } from "@/lib/security";
const schema=z.object({owner:z.string().min(1),repo:z.string().min(1),branch:z.string().optional()});
const TEXT_EXT=/\.(ts|tsx|js|jsx|mjs|cjs|py|go|java|rb|php|rs|yml|yaml|json|env|md|txt|sql|sh)$/i;
export async function POST(req:Request){try{
 const body=schema.parse(await req.json()); const info=await repoInfo(body.owner,body.repo); const branch=body.branch||info.default_branch||"main"; const tree=await repoTree(body.owner,body.repo,branch);
 const files=(tree.tree||[]).filter((x:any)=>x.type==="blob"&&(x.size??0)<=120000&&(TEXT_EXT.test(x.path)||/(^|\/)Dockerfile$/i.test(x.path))).slice(0,100);
 const findings:any[]=[]; const analyzed:string[]=[]; const sbom:Array<{name:string;version:string;scope:string}>=[];
 for(const file of files){try{const source=await fileContent(body.owner,body.repo,file.path,branch); analyzed.push(file.path);
   if(file.path.endsWith("package.json")){try{const pkg=JSON.parse(source) as any;Object.entries(pkg.dependencies||{}).forEach(([name,version])=>sbom.push({name,version:String(version),scope:"runtime"}));Object.entries(pkg.devDependencies||{}).forEach(([name,version])=>sbom.push({name,version:String(version),scope:"development"}));}catch{} findings.push(...scanPackageJson(source,file.path));}
   else if(/(^|\/)Dockerfile$/i.test(file.path)) findings.push(...scanDockerfile(source,file.path));
   else findings.push(...scanText(source,file.path));
 }catch{}}
 const score=scoreFindings(findings); const risk=classifyRisk(findings);
 return NextResponse.json({repository:`${body.owner}/${body.repo}`,branch,filesAnalyzed:analyzed.length,files:analyzed,findings,groups:groupFindings(findings),score,risk,policy:autonomyPolicy(risk),sbom,summary:{critical:findings.filter(f=>f.severity==="critical").length,high:findings.filter(f=>f.severity==="high").length,medium:findings.filter(f=>f.severity==="medium").length,low:findings.filter(f=>f.severity==="low").length}});
}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Repository scan failed"},{status:400});}}
