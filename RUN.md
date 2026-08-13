# NEXUS — Complete All-Phases Run Guide

## 1. Install

Use Node.js 20.9+.

```powershell
npm install
Copy-Item .env.example .env.local
```

## 2. Configure AI

```env
AI_PROVIDER=openai
AI_API_KEY=YOUR_KEY
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
AI_MODEL_ROUTING=true
```

Gemini:

```env
AI_PROVIDER=gemini
AI_API_KEY=YOUR_GEMINI_KEY
AI_MODEL=gemini-2.5-flash
```

## 3. Start

```powershell
npm run dev
```

Open `http://localhost:3000`.

## 4. Test the major systems

### Single agent
Enter:

```text
Analyze github.com/Krishna-Gudavalli/Sentinel-AI-Reviewer and identify security improvements.
```

### Autonomous orchestration
Open **Orchestration** and run:

```text
Audit the repository architecture, security posture, and developer experience.
```

### Security scanner
Open **Security** and scan:

```text
const key = 'sk-demo-secret';
eval(input);
element.innerHTML = userInput;
```

### Patch engine
Open **Patch Engine** and generate guarded proposals.

### Knowledge/RAG
Open **Knowledge**, ingest documentation, then retrieve by keyword.

### Evals
Open **AI Evals** and run the evaluation suite.

### Workflows
Create a Planner → Security → Approval → Report workflow.

### Schedules
Create a cron schedule. Run `node worker/scheduler.mjs` in another terminal for local execution.

### MCP
Register an MCP server URL under **MCP**.

### GitHub OAuth
Configure GitHub OAuth credentials, then visit:

`/api/github/oauth`

### CLI

```powershell
node cli/nexus.mjs orchestrate "research current AI agent reliability patterns"
```

## 5. Production build

```powershell
npm run build
npm start
```

## 6. Docker

```powershell
docker compose up --build
```

## 7. PostgreSQL

Run `db/schema.sql` against PostgreSQL and set `DATABASE_URL`. The application retains local JSON persistence for portable development; the database adapter is ready for migration.

## Important

The included security scanner and patch engine are portfolio-grade safeguards, not replacements for authoritative security tooling or an isolated code-execution service. Use CodeQL/Semgrep/Trivy/OSV-Scanner and a sandboxed worker for production deployments.

### Optional infrastructure profile

Start PostgreSQL and Redis locally with:

```powershell
docker compose --profile infra up -d postgres redis
```

Then set `DATABASE_URL=postgresql://nexus:nexus@localhost:5432/nexus` and apply `db/schema.sql`.
