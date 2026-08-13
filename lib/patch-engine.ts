import { SecurityFinding, PatchProposal } from "@/types/platform";

function sqlDiff(f: SecurityFinding, source: string) {
  const re = /(\b(?:db|database|client|connection|pool)\s*\.\s*(?:query|execute|run|prepare)\s*\(\s*)(["'`])([\s\S]*?)\2\s*\+\s*([A-Za-z_$][\w$]*)\s*\+\s*(["'`])([\s\S]*?)\5(\s*\))/m;
  const m = source.match(re);
  if (!m) return null;
  const replacement = `${m[1]}${m[2]}${m[3]}$1${m[6]}${m[2]}, [${m[4]}]${m[7]}`;
  const after = source.replace(re, () => replacement);
  if (after === source) return null;
  return {
    after,
    diff: `--- ${f.file}\n+++ ${f.file}\n@@ parameterized query\n- ${m[0].trim()}\n+ ${replacement.trim()}`,
    summary: `Converted the dynamic SQL query to a parameterized query and bound ${m[4]} separately.`,
  };
}

export function proposePatches(findings: SecurityFinding[], source: string): PatchProposal[] {
  return findings.map(f => {
    if (f.groupKey === "sql-injection" || f.title.includes("SQL injection")) {
      const patch = sqlDiff(f, source);
      if (patch) return {
        id: crypto.randomUUID(),
        findingId: f.id,
        file: f.file,
        summary: patch.summary,
        diff: patch.diff,
        safe: true,
        status: "draft",
      };
    }

    let replacement = "";
    if (f.title.includes("credential")) replacement = "process.env.SECRET_NAME";
    else if (f.title.includes("eval")) replacement = "/* replace dynamic evaluation with a safe parser */";
    else if (f.title.includes("HTML")) replacement = "/* render sanitized text */";
    else replacement = "/* replace with secure implementation */";

    return {
      id: crypto.randomUUID(),
      findingId: f.id,
      file: f.file,
      summary: f.remediation,
      diff: `--- ${f.file}\n+++ ${f.file}\n@@ finding\n- ${f.evidence}\n+ ${replacement}`,
      safe: f.severity !== "critical",
      status: "draft",
    };
  });
}

export function validatePatch(p: PatchProposal) {
  return p.diff.length < 5000 &&
    !p.diff.includes("rm -rf") &&
    !/curl\s+[^|]+\|\s*sh/i.test(p.diff) &&
    !p.diff.includes("powershell -enc");
}
