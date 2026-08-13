import { SecurityFinding } from "@/types/platform";

function finding(base: Omit<SecurityFinding,"id"|"file"|"line"|"evidence"|"groupKey"|"confidence">, file:string, line:number, evidence:string, groupKey:string, confidence:number, cwe?:string, owasp?:string): SecurityFinding {
  return {id:crypto.randomUUID(),...base,file,line,evidence:evidence.slice(0,220),groupKey,confidence,cwe,owasp};
}
function lineOf(text:string,index:number){return text.slice(0,index).split("\n").length;}
function context(lines:string[],i:number){return lines.slice(Math.max(0,i-3),Math.min(lines.length,i+8)).join("\n");}

export function scanText(text:string,file="input.ts"){
  const findings:SecurityFinding[]=[];
  const lines=text.split(/\r?\n/);
  const add=(base:Omit<SecurityFinding,"id"|"file"|"line"|"evidence"|"groupKey"|"confidence">,i:number,e:string,g:string,c:number,cwe?:string,owasp?:string)=>findings.push(finding(base,file,i+1,e,g,c,cwe,owasp));

  lines.forEach((line,i)=>{
    if(/(sk-[A-Za-z0-9_-]{12,}|ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})/.test(line)) add({severity:"critical",title:"Hardcoded credential detected",remediation:"Move the secret to an environment variable or secret manager and rotate the exposed credential.",category:"Secrets"},i,line,"hardcoded-credential",99,"CWE-798","A07:2021");
    if(/(AKIA[0-9A-Z]{16}|AWS_SECRET_ACCESS_KEY\s*[:=])/i.test(line)) add({severity:"critical",title:"Cloud credential pattern detected",remediation:"Remove and rotate the cloud credential; use workload identity or managed secret injection.",category:"Secrets"},i,line,"cloud-credential",98,"CWE-798","A07:2021");
    if(/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(line)) add({severity:"critical",title:"Private key detected",remediation:"Remove the key from source control and rotate the associated credential immediately.",category:"Secrets"},i,line,"private-key",99,"CWE-321","A07:2021");
    if(/eval\s*\(/.test(line)) add({severity:"high",title:"Dynamic code execution detected",remediation:"Avoid eval; use a constrained parser or explicit operations. High-risk remediation requires human approval.",category:"SAST"},i,line,"dynamic-code-execution",99,"CWE-95","A03:2021");
    if(/\b(child_process|execSync|spawn|execFile)\s*\(/.test(line)) add({severity:"high",title:"Process execution API detected",remediation:"Use a strict command allowlist, validated arguments, timeouts and sandboxing.",category:"SAST"},i,line,"process-execution",95,"CWE-78","A03:2021");
    if(/innerHTML\s*=|dangerouslySetInnerHTML/.test(line)) add({severity:"medium",title:"Potential HTML injection sink",remediation:"Sanitize untrusted content or render text safely instead of assigning raw HTML.",category:"SAST"},i,line,"html-injection",92,"CWE-79","A03:2021");
    if(/document\.write\s*\(|new Function\s*\(/.test(line)) add({severity:"high",title:"Dynamic browser code execution detected",remediation:"Avoid dynamic code generation and use explicit functions or safe rendering.",category:"SAST"},i,line,"browser-code-execution",96,"CWE-95","A03:2021");
    if(/http:\/\//.test(line)) add({severity:"low",title:"Plain HTTP URL detected",remediation:"Use HTTPS for network traffic and validate certificates.",category:"Configuration"},i,line,"plain-http",98,"CWE-319","A02:2021");
    if(/(password|secret|token|api[_-]?key)\s*[:=]\s*['"][^'"\n]{8,}['"]/i.test(line)) add({severity:"high",title:"Potential hardcoded secret detected",remediation:"Move secrets to environment variables or a managed secret store.",category:"Secrets"},i,line,"potential-secret",88,"CWE-798","A07:2021");
    if(/chmod\s+777|0o777/.test(line)) add({severity:"medium",title:"Overly permissive file permissions detected",remediation:"Use the least-privilege file mode required by the application.",category:"SAST"},i,line,"permissive-file-mode",96,"CWE-732","A05:2021");
  });

  // Context-aware SQL injection heuristic: SQL syntax + string concatenation + nearby DB execution.
  const sql=/\b(SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i;
  const concat=/\+\s*[A-Za-z_$][\w$]*/;
  lines.forEach((line,i)=>{
    if(!sql.test(line)||!concat.test(line)) return;
    const ctx=context(lines,i);
    const dbCall=/\b(db|database|client|connection|pool)\s*\.\s*(query|execute|run|prepare)\s*\(/i.test(ctx);
    const userInput=/\b(req|request|params|query|body|input|username|userId|email)\b/i.test(ctx);
    if(dbCall){
      add({severity:"high",title:"SQL injection via dynamic query construction",remediation:"Replace string concatenation with a parameterized query and bind user-controlled values separately.",category:"SAST"},i,ctx,"sql-injection",userInput?97:92,"CWE-89","A03:2021");
    } else {
      add({severity:"medium",title:"Potential dynamic query construction",remediation:"Confirm whether this SQL-like string reaches a database API. Prefer parameterized queries even when input appears trusted.",category:"SAST"},i,line,"dynamic-sql",68,"CWE-89","A03:2021");
    }
  });
  return findings;
}

export function scanPackageJson(text:string,file="package.json"){
  const findings:SecurityFinding[]=[];
  try{
    const pkg=JSON.parse(text) as any;
    const deps={...(pkg.dependencies||{}),...(pkg.devDependencies||{})};
    const lines=text.split(/\r?\n/);
    for(const [name,version] of Object.entries(deps)) if(typeof version==="string"&&/^(\*|latest|next|beta|alpha|canary)$/i.test(version)){
      const i=lines.findIndex(l=>l.includes(`"${name}"`));
      findings.push(finding({severity:"medium",title:"Unpinned dependency version detected",remediation:"Pin dependencies to reviewed versions and lock them in the package lockfile.",category:"Dependency hygiene"},file,Math.max(0,i)+1,`${name}: ${version}`,"unpinned-dependency",94,"CWE-1104","A06:2021"));
    }
    if(pkg.scripts?.postinstall&&/curl|wget|powershell|Invoke-WebRequest/i.test(pkg.scripts.postinstall)){
      const i=lines.findIndex(l=>l.includes('"postinstall"'));
      findings.push(finding({severity:"high",title:"Networked postinstall script detected",remediation:"Review install-time network execution and restrict scripts to trusted, auditable operations.",category:"Dependency hygiene"},file,Math.max(0,i)+1,String(pkg.scripts.postinstall),"networked-postinstall",90,"CWE-829","A08:2021"));
    }
  }catch{
    findings.push(finding({severity:"medium",title:"Invalid package manifest",remediation:"Fix the package manifest before automated dependency analysis.",category:"Dependency hygiene"},file,1,"package.json could not be parsed","invalid-manifest",99,"CWE-20","A05:2021"));
  }
  return findings;
}

export function scanDockerfile(text:string,file="Dockerfile"){
  const findings:SecurityFinding[]=[]; const lines=text.split(/\r?\n/);
  if(!/^\s*USER\s+\S+/im.test(text)) findings.push(finding({severity:"medium",title:"Container may run as root",remediation:"Create and run the container as a non-root user.",category:"Container"},file,1,"No non-root USER directive detected","docker-root",96,"CWE-250","A05:2021"));
  lines.forEach((line,i)=>{
    if(/curl[^|]+\|\s*(sh|bash)|wget[^|]+\|\s*(sh|bash)/i.test(line)) findings.push(finding({severity:"high",title:"Pipe-to-shell install detected",remediation:"Download, verify and execute trusted artifacts explicitly.",category:"Container"},file,i+1,line,"docker-pipe-shell",97,"CWE-494","A08:2021"));
    if(/^\s*ADD\s+https?:\/\//i.test(line)) findings.push(finding({severity:"medium",title:"Remote URL used with Docker ADD",remediation:"Download artifacts explicitly and verify their checksum before installation.",category:"Container"},file,i+1,line,"docker-remote-add",92,"CWE-829","A08:2021"));
  });
  return findings;
}

export function groupFindings(findings:SecurityFinding[]){
  const map=new Map<string,{groupKey:string;title:string;severity:SecurityFinding["severity"];category:string;confidence:number;occurrences:number;files:string[];cwe?:string;owasp?:string}>();
  for(const f of findings){const g=map.get(f.groupKey);if(!g) map.set(f.groupKey,{groupKey:f.groupKey,title:f.title,severity:f.severity,category:f.category,confidence:f.confidence,occurrences:1,files:[f.file],cwe:f.cwe,owasp:f.owasp});else{g.occurrences++;g.confidence=Math.max(g.confidence,f.confidence);if(!g.files.includes(f.file))g.files.push(f.file);}}
  return [...map.values()];
}

export function scoreFindings(findings:SecurityFinding[]){
  let score=100;
  for(const g of groupFindings(findings)) score-= (g.severity==="critical"?35:g.severity==="high"?20:g.severity==="medium"?10:4) + Math.min(8,Math.max(0,g.occurrences-1)*2);
  return Math.max(0,score);
}
export function classifyRisk(findings:SecurityFinding[]){if(findings.some(f=>f.severity==="critical"))return "CRITICAL" as const;if(findings.some(f=>f.severity==="high"))return "HIGH" as const;if(findings.some(f=>f.severity==="medium"))return "MEDIUM" as const;return findings.length?"LOW" as const:"CLEAN" as const;}
export function riskFromScore(score:number,findings:SecurityFinding[]){if(findings.some(f=>f.severity==="critical"))return "CRITICAL" as const;if(findings.some(f=>f.severity==="high")||score<60)return "HIGH" as const;if(findings.some(f=>f.severity==="medium")||score<80)return "MEDIUM" as const;return findings.length?"LOW" as const:"CLEAN" as const;}
export function autonomyPolicy(risk:ReturnType<typeof classifyRisk>){if(risk==="CRITICAL")return{mode:"GUARDED",approval:"security-engineer",message:"Critical findings require validated remediation and explicit security-engineer approval before any Git write."};if(risk==="HIGH")return{mode:"GUARDED",approval:"human",message:"High-risk changes require sandbox validation and explicit human approval."};if(risk==="MEDIUM")return{mode:"GUARDED",approval:"human",message:"Medium-risk changes require validation and explicit approval."};if(risk==="LOW")return{mode:"REVIEW",approval:"human",message:"Low-risk changes can be proposed automatically but still require review before Git writes."};return{mode:"NO_ACTION",approval:"none",message:"No security findings require remediation."};}
