import { ToolId } from "@/types/nexus";

export const toolDefinitions: Record<ToolId, {
  name: string;
  description: string;
  permission: "read" | "approval";
}> = {
  calculator: {
    name: "Calculator",
    description: "Safely evaluates basic arithmetic expressions.",
    permission: "read"
  },
  current_time: {
    name: "Current Time",
    description: "Returns the server's current ISO timestamp.",
    permission: "read"
  },
  github_repo: {
    name: "GitHub Repository",
    description: "Reads public GitHub repository metadata, README and recent commits.",
    permission: "read"
  },
  web_search: {
    name: "Web Search",
    description: "Searches the web using Tavily when configured.",
    permission: "read"
  }
};

function safeCalculate(expression: string) {
  const clean = expression.replace(/[^0-9+\-*/().%\s]/g, "");
  if (!clean.trim() || clean.length > 120) throw new Error("Invalid expression.");
  if (/\/\s*0(?:\D|$)/.test(clean)) throw new Error("Division by zero.");
  // Basic arithmetic only; Function receives a filtered expression with no identifiers.
  const result = Function(`"use strict"; return (${clean})`)();
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("Calculation failed.");
  return String(result);
}

async function githubRepo(input: string) {
  const repo = input.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error("Use owner/repository.");
  const headers: HeadersInit = { Accept: "application/vnd.github+json", "User-Agent": "NEXUS-Agent" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const base = `https://api.github.com/repos/${repo}`;
  const [metaRes, readmeRes, commitsRes] = await Promise.all([
    fetch(base, { headers, cache: "no-store" }),
    fetch(`${base}/readme`, { headers, cache: "no-store" }),
    fetch(`${base}/commits?per_page=5`, { headers, cache: "no-store" })
  ]);
  if (!metaRes.ok) throw new Error(`GitHub returned ${metaRes.status}.`);
  const meta = await metaRes.json();
  let readme = "";
  if (readmeRes.ok) {
    const r = await readmeRes.json();
    readme = Buffer.from(r.content || "", "base64").toString("utf8").slice(0, 7000);
  }
  const commits = commitsRes.ok ? await commitsRes.json() : [];
  return JSON.stringify({
    name: meta.full_name,
    description: meta.description,
    language: meta.language,
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    openIssues: meta.open_issues_count,
    defaultBranch: meta.default_branch,
    updatedAt: meta.updated_at,
    recentCommits: commits.map((c: any) => ({ message: c.commit?.message, date: c.commit?.author?.date })).slice(0, 5),
    readme
  }, null, 2);
}

async function webSearch(input: string) {
  if (!process.env.TAVILY_API_KEY) {
    return "Web search is not configured. Add TAVILY_API_KEY to .env.local to enable it.";
  }
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: input,
      search_depth: "basic",
      max_results: 5
    }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`Tavily returned ${res.status}.`);
  const data = await res.json();
  return JSON.stringify(data.results ?? [], null, 2);
}

export async function executeTool(tool: ToolId, input: string) {
  switch (tool) {
    case "calculator": return safeCalculate(input);
    case "current_time": return new Date().toISOString();
    case "github_repo": return githubRepo(input);
    case "web_search": return webSearch(input);
  }
}
