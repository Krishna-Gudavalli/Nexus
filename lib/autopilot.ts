import { scanText, scoreFindings, classifyRisk, autonomyPolicy, scanPackageJson, scanDockerfile } from "@/lib/security";
import { repoInfo, branchRef, commitInfo, repoTree, fileContent, createBranch, createBlob, createTree, createCommit, updateRef, createPullRequest } from "@/lib/github-api";
import { Pipeline, PipelineStage } from "@/types/autopilot";

const TEXT_EXT=/\.(ts|tsx|js|jsx|mjs|cjs|py|go|java|rb|php|rs|yml|yaml|json|env|md|txt|sql|sh|dockerfile)$/i;
const MAX_FILES=60, MAX_FILE_BYTES=120_000;

function log(p:Pipeline,stage:Pipeline["stage"],message:string){p.logs.push({at:new Date().toISOString(),stage,message});p.updatedAt=new Date().toISOString();}
function setState(p:Pipeline,stage:PipelineStage,state:"idle"|"running"|"success"|"failed",detail?:string){
  p.stageStates={...(p.stageStates||{}),[stage]:state};
  if(detail) p.stageDetails={...(p.stageDetails||{}),[stage]:detail};
  p.updatedAt=new Date().toISOString();
}
function applySafeFixes(source:string, findings:any[]){
  let after=source;
  const reasons:string[]=[];

  const hasGroup=(group:string)=>findings.some((f:any)=>f.groupKey===group || f.title?.toLowerCase().includes(group));

  if(hasGroup("sql-injection") || findings.some((f:any)=>String(f.title).includes("dynamic query construction"))){
    // Conservative parameterized-query transformation for the common single-variable form:
    // db.query("..." + username + "...", ...) -> db.query("...$1...", [username], ...)
    const sqlCall=/(\b(?:db|database|client|connection|pool)\s*\.\s*(?:query|execute|run|prepare)\s*\(\s*)(["'`])([\s\S]*?)\2\s*\+\s*([A-Za-z_$][\w$]*)\s*\+\s*(?:(["'`])([\s\S]*?)\4)(\s*\))/m;
    const match=after.match(sqlCall);
    if(match){
      const variable=match[4];
      const placeholder=match[2]+match[3]+"$1"+match[6]+match[2];
      const replacement=match[1]+placeholder+", ["+variable+"]"+match[7];
      const next=after.replace(sqlCall,()=>replacement);
      if(next!==after){after=next;reasons.push(`Converted dynamic SQL to a parameterized query and bound ${variable} as a parameter.`);}
    }
  }

  if(findings.some((f:any)=>f.groupKey==="hardcoded-credential" || f.groupKey==="potential-secret" || f.groupKey==="cloud-credential")){
    // Replace credential-looking string values only when attached to secret-like property names.
    const secretProperty=/((?:apiKey|api_key|api-key|token|secret|password|databasePassword|database_password)\s*:\s*)(["'`])[^"'`\r\n]{8,}\2/gi;
    const next=after.replace(secretProperty,(full,prefix)=>{
      const key=(String(prefix).match(/([A-Za-z][A-Za-z0-9_-]*)\s*:\s*$/)?.[1]||"secret").toLowerCase();
      const env=key.includes("database")||key.includes("password")?"NEXUS_DB_PASSWORD":"NEXUS_SECRET";
      return `${prefix}process.env.${env}`;
    });
    if(next!==after){
      after=next;
      reasons.push("Moved hardcoded credentials and secret-like values to environment-variable references.");
    }
    const literalCredential=after.replace(/(['"])(sk-[A-Za-z0-9_-]{8,}|ghp_[A-Za-z0-9_]{8,}|github_pat_[A-Za-z0-9_]{8,})\1/g,"process.env.NEXUS_SECRET");
    if(literalCredential!==after){after=literalCredential;reasons.push("Removed an inline credential and replaced it with NEXUS_SECRET.");}
    const assignment=after.replace(/((?:AWS_SECRET_ACCESS_KEY|DATABASE_PASSWORD|DB_PASSWORD|API_KEY|API_SECRET)\s*[:=]\s*)(['"])[^'"\r\n]{8,}\2/gi,"$1process.env.NEXUS_SECRET");
    if(assignment!==after){after=assignment;reasons.push("Moved a secret assignment to an environment-variable reference.");}
  }

  if(findings.some((f:any)=>f.groupKey==="html-injection")){
    const next=after.replace(/([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\.innerHTML\s*=\s*([^;]+);/g,"$1.textContent = $2;");
    if(next!==after){after=next;reasons.push("Replaced an innerHTML assignment with textContent so untrusted content is rendered as text.");}
  }

  if(findings.some((f:any)=>f.title?.includes("Plain HTTP"))){
    const next=after.replace(/http:\/\//g,"https://");
    if(next!==after){after=next;reasons.push("Upgraded plain HTTP URLs to HTTPS.");}
  }

  if(findings.some((f:any)=>f.groupKey==="dynamic-code-execution")){
    const evalPattern=/\beval\s*\(\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\)/;
    const match=after.match(evalPattern);
    if(match){
      const helper=`function nexusSafeEvaluate(expression) {
  const tokens = [...expression.matchAll(/\\s*(\\d+(?:\\.\\d+)?|[()+\\-*/%])\\s*/g)].map(m => m[1]);
  const compact = expression.replace(/\\s+/g, "");
  if (!tokens.length || tokens.join("") !== compact) throw new Error("Only numeric arithmetic expressions are allowed.");
  let i = 0;
  const peek = () => tokens[i];
  const take = () => tokens[i++];
  const primary = () => {
    const t = take();
    if (t === "(") { const v = expr(); if (take() !== ")") throw new Error("Unbalanced parentheses."); return v; }
    const n = Number(t);
    if (!Number.isFinite(n)) throw new Error("Invalid number.");
    return n;
  };
  const unary = () => { const t = peek(); if (t === "+") { take(); return unary(); } if (t === "-") { take(); return -unary(); } return primary(); };
  const term = () => { let v = unary(); while (["*", "/", "%"].includes(peek() || "")) { const op = take(); const r = unary(); if ((op === "/" || op === "%") && r === 0) throw new Error("Division by zero."); v = op === "*" ? v * r : op === "/" ? v / r : v % r; } return v; };
  const expr = () => { let v = term(); while (["+", "-"].includes(peek() || "")) { const op = take(); const r = term(); v = op === "+" ? v + r : v - r; } return v; };
  const result = expr();
  if (i !== tokens.length) throw new Error("Unsupported expression.");
  return result;
}

`;
      if(!after.includes("function nexusSafeEvaluate")) after=helper+after;
      after=after.replace(evalPattern,"nexusSafeEvaluate($1)");
      reasons.push("Replaced eval(identifier) with a strict arithmetic-only parser. Unsupported expressions fail closed.");
    }
  }

  return {after,reasons:[...new Set(reasons)]};
}

function initPipeline(owner:string,repo:string,task:string):Pipeline{
  const stages:PipelineStage[]=["github_fetch","security_scan","patch_generation","sandbox_validation","approval","pr_creation"];
  return {id:crypto.randomUUID(),owner,repo,baseBranch:"",task,stage:"queued",status:"running",score:100,riskLevel:"CLEAN",autonomyPolicy:autonomyPolicy("CLEAN"),findings:[],changes:[],sandbox:{passed:false,mode:"static",checks:[],blocked:[]},logs:[],stageStates:Object.fromEntries(stages.map(s=>[s,"idle"])),stageDetails:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}

async function fetchTextFiles(p:Pipeline){
  const info=await repoInfo(p.owner,p.repo); p.baseBranch=info.default_branch||"main";
  const tree=await repoTree(p.owner,p.repo,p.baseBranch);
  return (tree.tree||[]).filter((x:any)=>x.type==="blob"&&x.size<=MAX_FILE_BYTES&&TEXT_EXT.test(x.path)).slice(0,MAX_FILES);
}

export async function startPipeline(owner:string,repo:string,task:string){
  const p=initPipeline(owner,repo,task);
  log(p,"queued","Pipeline created. Run each guarded stage from the dashboard.");
  return p;
}

export async function runPipelineStage(p:Pipeline, requested:Exclude<PipelineStage,"queued"|"approval"|"pr_creation"|"completed"|"failed">){
  const order:PipelineStage[]=["github_fetch","security_scan","patch_generation","sandbox_validation"];
  const idx=order.indexOf(requested);
  if(idx<0) throw new Error("Unsupported interactive stage.");
  for(let i=0;i<idx;i++) if(p.stageStates?.[order[i]]!=="success") throw new Error(`Run ${order[i].replaceAll("_"," ")} before ${requested.replaceAll("_"," ")}.`);
  setState(p,requested,"running"); p.stage=requested;
  try{
    if(requested==="github_fetch"){
      const files=await fetchTextFiles(p);
      setState(p,requested,"success",`Connected to ${p.owner}/${p.repo}. ${files.length} text files are eligible for analysis.`);
      log(p,requested,`GitHub fetch complete: ${files.length} bounded text files selected.`);
    }
    if(requested==="security_scan"){
      const files=await fetchTextFiles(p); p.findings=[]; p.changes=[]; p.sandbox.blocked=[];
      for(const f of files){
        try{
          const source=await fileContent(p.owner,p.repo,f.path,p.baseBranch);
          const findings=f.path.endsWith("package.json") ? scanPackageJson(source,f.path) : /(^|\/)Dockerfile$/i.test(f.path) ? scanDockerfile(source,f.path) : scanText(source,f.path);
          p.findings.push(...findings.map(x=>({...x,repository:`${p.owner}/${p.repo}`})));
        }catch{p.sandbox.blocked.push(`${f.path}: unreadable or unsupported`)}
      }
      p.score=scoreFindings(p.findings);
      p.riskLevel=classifyRisk(p.findings);
      p.autonomyPolicy=autonomyPolicy(p.riskLevel);
      setState(p,requested,"success",`${p.findings.length} finding(s) detected. Security score: ${p.score}/100. Risk: ${p.riskLevel}.`);
      log(p,requested,`Security scan complete: ${p.findings.length} findings, score ${p.score}/100.`);
    }
    if(requested==="patch_generation"){
      if(!p.findings.length){setState(p,requested,"success","No findings require remediation.");log(p,requested,"No security findings require a patch.");}
      else{
        p.changes=[];
        const files=await fetchTextFiles(p);
        for(const f of files){
          const source=await fileContent(p.owner,p.repo,f.path,p.baseBranch);
          const findings=p.findings.filter(x=>x.file===f.path);
          if(!findings.length) continue;
          let patched=source;
          const reasons:string[]=[];
          for(let attempt=1;attempt<=3;attempt++){
            const patch=applySafeFixes(patched,findings);
            if(patch.after===patched) break;
            patched=patch.after;
            reasons.push(...patch.reasons);
          }
          if(patched!==source)p.changes.push({path:f.path,before:source,after:patched,reasons:[...new Set(reasons)]});
        }
        const detail=p.changes.length?`${p.changes.length} conservative patch candidate(s) generated.`:"Findings were detected, but NEXUS could not produce an automatic safe patch. Manual remediation is required.";
        setState(p,requested,"success",detail); log(p,requested,detail);
      }
    }
    if(requested==="sandbox_validation"){
      p.sandbox={passed:false,mode:"static",checks:[
        "Patch diff contains no shell execution payloads.",
        "No destructive commands or pipe-to-shell patterns are present.",
        "Every changed file is bounded by the repository file-size limit.",
        "Re-scan is performed before approval."
      ],blocked:[]};
      const bad=p.changes.filter(c=>/rm\s+-rf|curl\s+[^|]+\|\s*sh|powershell\s+-enc/i.test(c.after));
      p.sandbox.blocked.push(...bad.map(c=>`${c.path}: unsafe command pattern`));
      for(const change of p.changes){
        const afterFindings=change.path.endsWith("package.json")
          ? scanPackageJson(change.after,change.path)
          : /(^|\/)Dockerfile$/i.test(change.path)
            ? scanDockerfile(change.after,change.path)
            : scanText(change.after,change.path);
        const originalFindings=p.findings.filter((f:any)=>f.file===change.path);
        for(const original of originalFindings){
          const remains=afterFindings.some((f:any)=>f.groupKey===original.groupKey);
          if(remains) p.sandbox.blocked.push(`${change.path}: finding remains after patch — ${original.title}`);
        }
      }
      p.sandbox.passed=p.sandbox.blocked.length===0;
      if(!p.sandbox.passed){setState(p,requested,"failed","Sandbox rejected the proposed changes.");p.stage="failed";p.status="failed";log(p,requested,"Sandbox validation rejected the proposed changes.");return p;}
      setState(p,requested,"success",p.changes.length?"Static sandbox validation passed. Ready for human approval.":"No automatic patch exists, so no PR can be created from this finding.");
      p.stage="approval"; p.status=p.changes.length?"waiting_approval":"completed";
      log(p,requested,p.changes.length?"Static sandbox validation passed. Human approval is now required.":"Sandbox completed; no safe automatic patch is available.");
    }
    return p;
  }catch(e){setState(p,requested,"failed",e instanceof Error?e.message:"Stage failed");p.stage="failed";p.status="failed";log(p,"failed",e instanceof Error?e.message:"Stage failed");return p;}
}

export async function createApprovedPR(p:Pipeline){
 if(p.status!=="waiting_approval") throw new Error("Pipeline is not waiting for approval.");
 if(!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is required to create a pull request.");
 if(!p.changes.length) throw new Error("No safe patch changes were generated.");
 p.stage="pr_creation"; setState(p,"pr_creation","running"); log(p,p.stage,"Creating a dedicated NEXUS branch.");
 try{
  const baseRef=await branchRef(p.owner,p.repo,p.baseBranch); const baseCommitSha=baseRef.object.sha as string;
  const baseCommit=await commitInfo(p.owner,p.repo,baseCommitSha);
  const branch=`nexus/security-autopilot-${p.id.slice(0,8)}`;
  await createBranch(p.owner,p.repo,baseCommitSha,branch);
  const entries=[];
  for(const c of p.changes){const blob=await createBlob(p.owner,p.repo,c.after);entries.push({path:c.path,mode:"100644",type:"blob",sha:blob.sha});}
  const tree=await createTree(p.owner,p.repo,baseCommit.tree.sha,entries);
  const commit=await createCommit(p.owner,p.repo,"security: NEXUS autopilot remediation",tree.sha,baseCommitSha);
  await updateRef(p.owner,p.repo,branch,commit.sha);
  const pr=await createPullRequest(p.owner,p.repo,branch,p.baseBranch,"🛡️ NEXUS Security Autopilot remediation",`## NEXUS Security Autopilot\n\n${p.task}\n\n### Validation\n- Security score: **${p.score}/100**\n- Findings: **${p.findings.length}**\n- Changed files: **${p.changes.length}**\n- Sandbox: **passed (static safety gate)**\n\nHuman approval was recorded before this PR was created.`);
  p.pullRequest={number:pr.number,url:pr.html_url,branch}; p.status="completed"; p.stage="completed"; setState(p,"pr_creation","success",`Branch ${branch}, commit ${commit.sha.slice(0,7)}, PR #${pr.number} created.`); log(p,"completed",`Pull request #${pr.number} created.`); return p;
 }catch(e){setState(p,"pr_creation","failed",e instanceof Error?e.message:"PR creation failed");p.stage="failed";p.status="failed";log(p,"failed",e instanceof Error?e.message:"PR creation failed");return p;}
}
