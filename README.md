# 🚀 NEXUS — Autonomous AI Security & Engineering Platform

> **A provider-neutral AI agent operating system for software engineering, security analysis, guarded remediation, validation, and GitHub pull-request automation.**

NEXUS combines **specialist AI agents**, **multi-provider model routing**, **repository intelligence**, **SAST-style security scanning**, **conservative patch generation**, **sandbox validation**, **human approval**, and **GitHub PR creation** into one controlled workflow.

The central idea is simple:

```text
🐙 Repository
      ↓
🔎 Understand + Scan
      ↓
🛡️ Identify Risk
      ↓
🧠 Analyze with AI
      ↓
🔧 Generate a Conservative Patch
      ↓
🧪 Re-scan + Safety Gate
      ↓
👤 Human Approval
      ↓
🌿 Branch
      ↓
💾 Commit
      ↓
🔀 Pull Request
```

NEXUS is deliberately **guarded**. AI can propose and validate changes, but high-risk repository writes are not silently performed.

---

# 🎬 NEXUS Demo Video

Watch the polished NEXUS demonstration showing the platform UI, AI specialists, model routing, security scanning, patch generation, and the Researcher AI runtime in action. 🚀

### ▶️ Demo

**[🎥 Open / Watch the NEXUS 3.2.4 Demo Video](docs/demo/NEXUS-3.2.4-POLISHED-DEMO.mp4)**

The source MP4 is included directly in this repository under `docs/demo/`, so the final project package contains both the application and its demonstration asset.

> **Demo flow:** 🐙 GitHub → 🔎 Security Scan → 🤖 AI Analysis → 🔧 Safe Patch → 🧪 Sandbox Validation → 👤 Approval → 🔀 Pull Request

---

# 🌟 What Is NEXUS?

NEXUS is designed as an **AI engineering control plane** rather than a simple chatbot.

It has two major sides:

### 🤖 AI Engineering Platform

NEXUS can run specialist agents for:

- 🔎 repository research
- 🛡️ vulnerability analysis
- 🔧 remediation and patch generation
- 🧠 multi-agent orchestration
- 🔀 provider/model routing
- 🧰 tool-assisted tasks
- 📊 run and provider visibility

### 🛡️ Security Autopilot

NEXUS can:

- connect to a GitHub repository
- fetch bounded source files
- inspect source and manifests
- detect common security weaknesses
- group findings
- calculate a security score
- classify risk
- generate conservative remediations
- re-scan patched content
- reject unsafe or incomplete patches
- stop for human approval
- create a dedicated branch
- create a commit
- create a pull request

---

# 🧠 The Three NEXUS AI Specialists

NEXUS exposes three clear user-facing specialist identities.

The underlying model can change. The **agent role does not**.

## 🔎 Researcher AI — Research & Repository Intelligence

**Purpose:** Understand the repository before making decisions.

Researcher AI is responsible for:

- repository architecture context
- source-code investigation
- dependency/context discovery
- evidence gathering
- repository-aware reasoning
- research questions
- calculations and tool-assisted tasks
- preparing context for downstream agents

Example demo:

```text
Task:
18 * 7 + 4
```

Researcher AI returns:

```text
The calculation for 18 * 7 + 4 is 130,
as confirmed by the calculator tool.
```

This demonstrates that the agent can combine a natural-language request with a tool-backed result rather than simply presenting a guess.

---

## 🛡️ Security AI — Vulnerability Detection & Analysis

**Purpose:** Find security weaknesses and explain why they matter.

Security AI works with scanner evidence such as:

```js
const key = 'sk-demo-secret';
eval(input);
const html = userInput;
element.innerHTML = html;
```

Typical findings include:

- 🔐 hardcoded credentials
- 💥 dynamic code execution
- 🧪 injection/query construction
- 🧬 HTML/XSS sinks
- 🌐 insecure HTTP usage
- 🐳 Docker hardening issues
- 📦 manifest/dependency hygiene issues
- 🔑 private-key or secret-like material

Each finding can carry:

- severity
- confidence
- category
- file
- line
- evidence
- remediation
- CWE
- OWASP mapping
- grouping information

---

## 🔧 Fixer AI — Remediation & Patch Generation

**Purpose:** Turn validated findings into focused, conservative changes.

Fixer AI does **not** get permission to blindly rewrite the repository.

Instead, NEXUS:

1. identifies a finding
2. selects a supported remediation strategy
3. creates a bounded change
4. validates the change
5. re-scans the changed file
6. blocks the pipeline if the original finding remains
7. requires approval before Git writes

Examples:

### `eval()` remediation

Unsafe:

```js
export function calculate(expression) {
  return eval(expression);
}
```

NEXUS replaces this with a constrained arithmetic parser that:

- accepts only numeric arithmetic tokens
- supports parentheses
- supports `+`, `-`, `*`, `/`, `%`
- rejects unsupported expressions
- rejects invalid numbers
- rejects division/modulo by zero
- never executes arbitrary JavaScript

### Secret remediation

Unsafe:

```js
export const config = {
  apiKey: "sk-test-example",
  databasePassword: "SuperSecretPassword123!"
};
```

Safer:

```js
export const config = {
  apiKey: process.env.NEXUS_SECRET,
  databasePassword: process.env.NEXUS_DB_PASSWORD
};
```

The actual secret values should then be supplied through `.env.local`, a deployment secret manager, or another secure runtime mechanism.

### HTML injection remediation

Unsafe:

```js
element.innerHTML = "Welcome " + username;
```

Safer pattern:

```js
element.textContent = "Welcome " + username;
```

---

# 🖥️ NEXUS Dashboard — What You Can See

The project includes several control-plane views.

## 1. 🛡️ Security Autopilot

The Autopilot page presents the guarded GitHub workflow:

```text
GitHub → Scan → Patch → Sandbox → PR
```

The page also explains that NEXUS pauses before Git writes and requires explicit human approval.

![NEXUS Security Autopilot](docs/screenshots/01-security-autopilot.png)

---

## 2. 🧠 Command Center / Agent Runtime

The Command Center provides a universal task console.

It shows:

- number of runs
- success rate
- latency
- tool calls
- selected specialist
- integrations
- security boundary
- agent output

![NEXUS Command Center](docs/screenshots/02-command-center-agents.png)

The agent selector exposes:

```text
🛡️ Security AI — Vulnerability detection & analysis
🔎 Researcher AI — Research & repository intelligence
🔧 Fixer AI — Remediation & patch generation
```

---

## 3. 🔀 Model Router

The Model Router is the provider abstraction layer.

It can display providers such as:

- OpenAI
- Google Gemini
- Anthropic
- OpenRouter
- Ollama
- OmniRoute

![NEXUS Model Router](docs/screenshots/03-model-router.png)

The important design principle is:

> **The specialist agent is separate from the provider.**

For example:

```text
Security AI
   ↓
NEXUS Model Router
   ↓
OmniRoute
   ↓
Gemini / OpenAI / OpenRouter / local model
```

That means changing providers does not require changing the user-facing security agent.

---

## 4. 🤖 AI Specialists

The dedicated Agents page shows the three specialist roles.

![NEXUS AI Specialists](docs/screenshots/04-ai-specialists.png)

Each agent has a clear responsibility instead of presenting one generic “AI” button.

---

## 5. 🔐 Security Command Center

The Security page supports both:

### Local code scanning

Paste code into the local scanner and run a security analysis.

### GitHub repository intelligence

Enter:

```text
Owner
Repository
Branch (optional)
```

and NEXUS can scan a repository you control.

![NEXUS Security Command Center](docs/screenshots/05-security-command-center.png)

---

## 6. 📊 Security Scan Result

A scan produces a score and grouped findings.

Example demo state:

```text
70/100
2 risk groups
```

![NEXUS Security Scan Result](docs/screenshots/06-security-scan-result.png)

The exact score depends on the scanner rules and findings present in the input repository.

---

## 7. 🔧 AI Patch Engine

The Patch Engine displays proposed changes and their validation state.

![NEXUS AI Patch Engine](docs/screenshots/07-ai-patch-engine.png)

The important distinction is:

```text
Finding
   ↓
Patch proposal
   ↓
Validation
   ↓
Approval
   ↓
Git write
```

A patch proposal is not automatically a repository write.

---

## 8. 🔎 Researcher AI Demonstration

The Command Center can run a tool-assisted Researcher AI task.

![Researcher AI Demo](docs/screenshots/08-researcher-ai-demo.png)

Example:

```text
18 * 7 + 4
```

Result:

```text
130
```

This is useful in a portfolio demonstration because it visibly shows the difference between a specialist agent and a static UI.

---

# 🛡️ Security Autopilot — Full End-to-End Flow

This is the most important workflow in NEXUS.

## Phase 1 — 🐙 GitHub Fetch

NEXUS connects to the selected repository using the GitHub API.

It identifies:

- default branch
- repository tree
- eligible text files
- file sizes
- supported source/config formats

The implementation bounds repository analysis with limits such as:

- maximum analyzed files
- maximum file size
- supported text extensions

This prevents the scanner from blindly loading an unbounded repository.

---

## Phase 2 — 🔎 Security Scan

Each eligible file is passed through the appropriate scanner.

Examples:

```text
JavaScript / TypeScript
Python
Go
Java
Ruby
PHP
Rust
YAML
JSON
SQL
Shell
Dockerfile
package.json
```

NEXUS can inspect for categories such as:

### 🔐 Secrets

Examples:

```text
apiKey
token
password
secret
private key material
cloud credentials
```

### 💥 Dynamic Code Execution

Example:

```js
eval(expression);
```

### 💉 Injection / Query Construction

Example:

```js
db.query("SELECT ... '" + username + "'");
```

### 🧬 HTML Injection

Example:

```js
element.innerHTML = userInput;
```

### 🐳 Container Risks

Examples:

- missing non-root `USER`
- pipe-to-shell installation
- remote URL in Docker `ADD`

### 📦 Manifest Hygiene

The package scanner can inspect dependency declarations for risky or suspicious patterns.

---

# 📊 Security Scoring

NEXUS starts from a baseline of:

```text
100 / 100
```

It subtracts points based on grouped findings.

Conceptually:

```text
Critical finding → large deduction
High finding     → significant deduction
Medium finding   → moderate deduction
Low finding      → small deduction
Repeated group   → additional deduction
```

The result becomes the repository's security score.

Example:

```text
100
 ↓
finding penalties
 ↓
70/100
```

The score is a **NEXUS risk indicator**, not a replacement for a full commercial security assessment.

---

# 🚦 Risk Classification & Autonomy Policy

NEXUS uses risk to determine how much autonomy is allowed.

| Risk | Policy |
|---|---|
| 🟢 CLEAN | No remediation required |
| 🟡 LOW | Proposal + human review |
| 🟠 MEDIUM | Guarded patch + sandbox + approval |
| 🔴 HIGH | Guarded patch + sandbox + mandatory approval |
| 🚨 CRITICAL | Security-engineer review required |

The key safety rule is:

> **AI does not get unrestricted Git write access merely because it generated a patch.**

---

# 🔧 Phase 3 — AI Patch Generation

For supported findings, NEXUS creates conservative changes.

Examples include:

```text
eval()
   ↓
constrained parser
```

```text
hardcoded API key
   ↓
process.env.NEXUS_SECRET
```

```text
hardcoded DB password
   ↓
process.env.NEXUS_DB_PASSWORD
```

```text
innerHTML
   ↓
textContent
```

```text
dynamic SQL
   ↓
parameterized query
```

The remediation engine is deliberately conservative.

If it cannot confidently produce a supported safe transformation, it should leave the finding for manual remediation instead of inventing a risky patch.

---

# 🧪 Phase 4 — Sandbox Validation

This is one of the most important parts of NEXUS.

The sandbox gate performs safety checks such as:

```text
✓ No destructive shell payloads
✓ No pipe-to-shell patterns
✓ Changed files remain within size limits
✓ Changed content is re-scanned
✓ Original finding groups must disappear
```

A proposed patch is rejected if a finding remains after remediation.

For example:

```text
Original:
hardcoded-credential

Patch:
apiKey → process.env.NEXUS_SECRET

But:
databasePassword → still hardcoded

Result:
❌ SANDBOX BLOCKED
```

This is exactly the kind of failure that NEXUS is designed to catch.

The pipeline must not proceed merely because an AI generated *some* change.

---

# 👤 Phase 5 — Human Approval

When the sandbox passes, NEXUS moves into a guarded approval state.

```text
Sandbox PASSED
      ↓
READY FOR APPROVAL
      ↓
Human / Security Engineer
      ↓
APPROVE
```

Only after approval can NEXUS perform Git writes.

---

# 🌿 Phase 6 — Branch Creation

NEXUS creates a dedicated branch similar to:

```text
nexus/security-autopilot-xxxxxxxx
```

This isolates the remediation from the repository's main branch.

---

# 💾 Phase 7 — Commit

NEXUS creates:

```text
security: NEXUS autopilot remediation
```

The commit contains only the validated changed files.

---

# 🔀 Phase 8 — Pull Request

NEXUS creates a GitHub pull request with:

- task description
- security score
- number of findings
- number of changed files
- sandbox validation result
- approval state

Example title:

```text
🛡️ NEXUS Security Autopilot remediation
```

This gives the repository owner a normal GitHub review point.

---

# 🧠 Multi-Agent Orchestration

NEXUS can run several specialist agents for one task.

The high-level orchestration model is:

```text
                    User Task
                       ↓
                 Agent Selection
                       ↓
          ┌────────────┼────────────┐
          ↓            ↓            ↓
      Researcher    Security      Fixer
          ↓            ↓            ↓
       Context      Findings      Patches
          └────────────┼────────────┘
                       ↓
                NEXUS Synthesizer
                       ↓
                  Final Result
```

Agent selection is task-aware.

Examples:

```text
"Investigate repository architecture"
        ↓
Researcher AI

"Find security vulnerabilities"
        ↓
Security AI

"Fix this vulnerability"
        ↓
Fixer AI
```

For autonomous tasks, multiple active specialists can be selected and their outputs synthesized.

---

# 🔀 Multi-Provider AI Gateway

NEXUS is provider-neutral.

Supported provider identifiers in this release are:

```text
openai
gemini
anthropic
openrouter
ollama
omniroute
```

The provider gateway exposes a common interface so the rest of NEXUS does not need to know every provider's API format.

---

# 🔁 Automatic Fallback

Example:

```env
AI_PROVIDER=omniroute
AI_FALLBACK_PROVIDERS=gemini,openrouter,ollama
```

The routing sequence becomes:

```text
1. 🔀 OmniRoute
      ↓
   failed / quota / timeout
      ↓
2. ♊ Gemini
      ↓
   failed
      ↓
3. 🌐 OpenRouter
      ↓
   failed
      ↓
4. 🦙 Ollama
```

The first successful provider returns the response.

NEXUS also handles providers that return OpenAI-compatible JSON or SSE-style responses.

---

# 🔑 API Keys & Provider Setup

This section explains exactly what you need to configure.

## 📋 Environment Variables

Copy:

```powershell
Copy-Item .env.example .env.local
```

The main variables are:

```env
AI_PROVIDER=omniroute
AI_FALLBACK_PROVIDERS=gemini,openrouter,ollama
NEXUS_MAX_OUTPUT_TOKENS=2048

OMNIROUTE_BASE_URL=http://localhost:20128/v1
OMNIROUTE_API_KEY=
OMNIROUTE_MODEL=auto

OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini

GEMINI_API_KEY=
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-2.5-flash

ANTHROPIC_API_KEY=
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
ANTHROPIC_MODEL=claude-3-5-haiku-latest

OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini

OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2

GITHUB_TOKEN=
GITHUB_WEBHOOK_SECRET=

TAVILY_API_KEY=
DATABASE_URL=
NEXUS_SANDBOX_DOCKER=false
```

---

# ⭐ Recommended Setup: OmniRoute

OmniRoute is a **local OpenAI-compatible gateway**.

Current documented defaults are:

```text
Dashboard:
http://localhost:20128

API:
http://localhost:20128/v1
```

The official OmniRoute project currently documents npm installation, a local dashboard, provider connections, endpoint API keys, automatic routing, and fallback behavior.

## 1. Install OmniRoute

```powershell
npm install -g omniroute
```

## 2. Start it

```powershell
omniroute
```

Open:

```text
http://localhost:20128
```

## 3. Connect a provider

Inside the OmniRoute dashboard:

```text
Providers
   ↓
Connect a provider
```

You can connect a provider through its supported authentication method.

## 4. Create an OmniRoute endpoint key

Go to:

```text
Endpoints
   ↓
Create API Key
```

Copy the generated endpoint key.

## 5. Configure NEXUS

```env
AI_PROVIDER=omniroute
AI_FALLBACK_PROVIDERS=gemini,openrouter,ollama

OMNIROUTE_BASE_URL=http://localhost:20128/v1
OMNIROUTE_API_KEY=YOUR_OMNIROUTE_ENDPOINT_KEY
OMNIROUTE_MODEL=auto
```

## 6. Test OmniRoute

```powershell
curl http://localhost:20128/v1/models -H "Authorization: Bearer YOUR_OMNIROUTE_ENDPOINT_KEY"
```

You should receive a list of available models.

### Important

The **OmniRoute endpoint key is not the same thing as a Gemini/OpenAI/Anthropic provider key**.

OmniRoute is the local gateway.

The provider credentials are configured inside OmniRoute.

Official references:

- https://github.com/CarlaSalles-AI/omniroute
- https://github.com/diegosouzapw/OmniRoute/wiki/Setup-Guide

---

# ♊ Google Gemini API Key

NEXUS supports Gemini directly through:

```env
GEMINI_API_KEY=
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-2.5-flash
```

## How to get a Gemini API key

1. Open **Google AI Studio**.
2. Sign in with your Google account.
3. Open the **API Keys** section.
4. Create a new API key.
5. Copy the key.
6. Put it in `.env.local`.

Example:

```env
GEMINI_API_KEY=YOUR_GEMINI_KEY
```

Do **not** paste the real key into GitHub.

Google's current Gemini documentation says new keys created in AI Studio are moving to the newer authorization-key model, and Google recommends migrating older standard keys before the September 2026 enforcement change.

Official documentation:

https://ai.google.dev/gemini-api/docs/api-key

### Test configuration

```env
AI_PROVIDER=gemini
AI_FALLBACK_PROVIDERS=openrouter,ollama

GEMINI_API_KEY=YOUR_GEMINI_KEY
GEMINI_MODEL=gemini-2.5-flash
```

Restart NEXUS after changing `.env.local`.

---

# 🤖 OpenAI API Key

For direct OpenAI usage:

```env
AI_PROVIDER=openai
AI_FALLBACK_PROVIDERS=gemini,openrouter,ollama

OPENAI_API_KEY=YOUR_OPENAI_KEY
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
```

## Setup

1. Sign in to the OpenAI API platform.
2. Open your project/API key management area.
3. Create a project API key.
4. Copy it immediately.
5. Store it only in `.env.local`.

Official API documentation:

https://platform.openai.com/docs/api-reference/

OpenAI explicitly recommends keeping API keys secret and loading them server-side from environment variables or a key-management system.

---

# 🧠 Anthropic API Key

For direct Claude-compatible access:

```env
AI_PROVIDER=anthropic
AI_FALLBACK_PROVIDERS=gemini,openrouter,ollama

ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

## Setup

1. Open the Anthropic Console.
2. Create/select an API project.
3. Create an API key.
4. Copy it.
5. Store it in `.env.local`.

Official documentation:

https://docs.anthropic.com/

---

# 🌐 OpenRouter API Key

OpenRouter gives NEXUS access to many model providers through one OpenAI-compatible API.

Configuration:

```env
AI_PROVIDER=openrouter
AI_FALLBACK_PROVIDERS=gemini,ollama

OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini
```

## Setup

1. Create/sign in to your OpenRouter account.
2. Open API key management.
3. Create a key.
4. Set an appropriate spending/usage limit if available.
5. Copy the key.
6. Store it in `.env.local`.

Official quickstart:

https://openrouter.ai/docs/quickstart

OpenRouter API keys are sensitive credentials. Treat them like passwords.

---

# 🦙 Ollama — Local AI

Ollama allows NEXUS to use local models without a cloud API key.

Install Ollama from:

https://ollama.com/

Then pull a model:

```powershell
ollama pull llama3.2
```

Configure:

```env
AI_PROVIDER=ollama
AI_FALLBACK_PROVIDERS=omniroute,gemini

OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2
```

Start/verify Ollama:

```powershell
ollama list
```

This is useful when you want a local fallback or want to experiment without sending requests to a hosted provider.

---

# 🐙 GitHub Token Setup

NEXUS uses the GitHub REST API for repository intelligence and the guarded PR workflow.

Set:

```env
GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

## Recommended token type

Use a **fine-grained personal access token** when possible.

GitHub recommends fine-grained tokens over classic tokens because access can be limited to selected repositories and specific permissions.

## How to create it

1. Open GitHub.
2. Go to **Settings**.
3. Open **Developer settings**.
4. Open **Personal access tokens**.
5. Select **Fine-grained tokens**.
6. Click **Generate new token**.
7. Give it a descriptive name.
8. Select an expiration.
9. Restrict it to the test repository you want NEXUS to access.
10. Grant only the permissions required by your workflow.
11. Generate the token.
12. Copy it immediately.
13. Put it in `.env.local`.

For the full GitHub workflow, NEXUS needs permission to read repository content and, when creating a PR, appropriate write permissions for repository contents and pull requests.

Official GitHub documentation:

https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

GitHub permissions reference:

https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens

### 🔐 Important

Never:

```text
❌ commit GITHUB_TOKEN
❌ put it in React/client-side code
❌ paste it into screenshots
❌ put it in README.md
❌ upload it to GitHub
```

If a token is accidentally exposed, revoke/rotate it immediately.

---

# 🔐 `.env.local` Security

Your real `.env.local` should look like:

```env
GEMINI_API_KEY=real-secret
OPENROUTER_API_KEY=real-secret
GITHUB_TOKEN=real-secret
OMNIROUTE_API_KEY=real-secret
```

but **those values must never be committed**.

The repository should contain:

```text
.env.example
```

and not:

```text
.env.local
```

Recommended `.gitignore` entries:

```gitignore
.env
.env.local
.env.*.local
```

---

# 🏗️ Installation From Zero

## Step 1 — Node.js

Install Node.js 22+.

Verify:

```powershell
node --version
npm --version
```

---

## Step 2 — Extract NEXUS

```powershell
cd C:\path\to\NEXUS-3.2.4-AUTONOMOUS-REMEDIATION
```

---

## Step 3 — Install packages

```powershell
npm install
```

---

## Step 4 — Create environment file

```powershell
Copy-Item .env.example .env.local
```

---

## Step 5 — Configure one AI provider

The easiest starting options are:

### OmniRoute

```env
AI_PROVIDER=omniroute
OMNIROUTE_BASE_URL=http://localhost:20128/v1
OMNIROUTE_API_KEY=YOUR_KEY
OMNIROUTE_MODEL=auto
```

### Gemini

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_KEY
GEMINI_MODEL=gemini-2.5-flash
```

### Ollama

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2
```

---

## Step 6 — Add GitHub access

```env
GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

---

## Step 7 — Start NEXUS

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Complete Demo Script

For a strong portfolio/demo video, use this sequence.

## Demo 1 — Agent intelligence

Open:

```text
Command Center
```

Select:

```text
Researcher AI
```

Enter:

```text
18 * 7 + 4
```

Run the agent.

Expected result:

```text
130
```

---

## Demo 2 — Security AI

Open:

```text
Security
```

Load the security demo.

Example vulnerable code:

```js
const key = 'sk-demo-secret';

eval(input);

const html = userInput;
element.innerHTML = html;
```

Run:

```text
Scan code
```

Show the resulting findings.

---

## Demo 3 — Fixer AI

Open:

```text
Patch Engine
```

Generate patches.

Show:

```text
eval(...)
   ↓
safe implementation

innerHTML
   ↓
textContent
```

The patch should show as validated before it becomes eligible for approval.

---

## Demo 4 — GitHub Security Autopilot

Create/use a test repository you control:

```text
Krishna-Gudavalli/nexus-security-test
```

Enter:

```text
Owner:
Krishna-Gudavalli

Repository:
nexus-security-test

Branch:
main
```

Then run:

```text
GitHub Fetch
      ↓
Security Scan
      ↓
AI Patch
      ↓
Sandbox
      ↓
Approval
      ↓
Pull Request
```

For a real demo, use **fake credentials only**.

---

# 🧪 Recommended Security Test Repository

A deliberately vulnerable repository is useful for demonstrating the complete pipeline.

Example:

### `calculator.js`

```js
// INTENTIONALLY VULNERABLE — DEMO ONLY

export function calculate(expression) {
  return eval(expression);
}
```

### `config.js`

```js
// INTENTIONALLY VULNERABLE — DEMO ONLY

export const config = {
  apiKey: "sk-test-1234567890-example-secret",
  databasePassword: "SuperSecretPassword123!"
};
```

### `profile.js`

```js
// INTENTIONALLY VULNERABLE — DEMO ONLY

export function renderProfile(element, username) {
  element.innerHTML = "Welcome " + username;
}
```

These are **fake demonstration values**.

Do not replace them with real credentials.

---

# 🔄 What Happens During the Test

Suppose the scanner finds:

```text
Dynamic code execution
Hardcoded credential
Potential hardcoded secret
Potential HTML injection sink
```

NEXUS groups the findings.

Then Fixer AI proposes:

```text
calculator.js
    eval → constrained arithmetic parser

config.js
    apiKey → process.env.NEXUS_SECRET
    databasePassword → process.env.NEXUS_DB_PASSWORD

profile.js
    innerHTML → textContent
```

The sandbox then re-scans the changed files.

If everything is resolved:

```text
🟢 Sandbox PASSED
```

NEXUS moves to:

```text
👤 Waiting for approval
```

After approval:

```text
🌿 Create branch
       ↓
💾 Create commit
       ↓
🔀 Create PR
```

---

# 🚨 Example of a Failed Sandbox

NEXUS is also designed to demonstrate failure safely.

Imagine the original repository has:

```js
apiKey: "fake-secret",
databasePassword: "fake-password"
```

but the patch only changes:

```js
apiKey: process.env.NEXUS_SECRET
```

The database password remains hardcoded.

The sandbox re-scan detects:

```text
❌ config.js:
Potential hardcoded secret remains
```

Therefore:

```text
Sandbox:
FAILED

Approval:
BLOCKED

PR:
NOT CREATED
```

This is intentional.

It prevents a partially fixed repository from being presented as successfully remediated.

---

# 🔒 Why the Human Approval Gate Matters

The architecture intentionally separates:

```text
AI reasoning
```

from:

```text
Git write authority
```

AI may generate a patch.

AI may validate a patch.

But Git writes require the guarded workflow.

This makes the system more appropriate for security-sensitive automation.

---

# 🧭 System Architecture

```text
                           🧠 NEXUS
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Agent Runtime       Security Control Plane
                    │                   │
          ┌─────────┼─────────┐        │
          ↓         ↓         ↓        ↓
      Researcher Security   Fixer   Scanner
          │         │         │        │
          └─────────┼─────────┘        │
                    ↓                  ↓
                 Tools            Findings
                    │                  │
                    └────────┬─────────┘
                             ↓
                       AI Gateway
                             ↓
                    ┌────────┴────────┐
                    ↓                 ↓
              Direct Providers     OmniRoute
                    │                 │
       ┌────────────┼────────────┐    │
       ↓            ↓            ↓    ↓
    OpenAI       Gemini      Anthropic OpenRouter/
                                      Ollama/etc.
                    │
                    ↓
                AI Response
                    │
                    ↓
               Patch Engine
                    │
                    ↓
             Sandbox Re-scan
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
       BLOCKED              PASSED
          │                   │
          │             Human Approval
          │                   │
          │                   ↓
          │                GitHub
          │                   │
          │            ┌──────┴──────┐
          │            ↓             ↓
          │         Branch         Commit
          │                          │
          │                          ↓
          │                         PR
          ↓
       Manual remediation
```

---

# 📁 Important Project Structure

The project is organized around the control-plane architecture.

```text
NEXUS/
├── app/
│   ├── api/
│   │   ├── agents/
│   │   ├── github/
│   │   ├── providers/
│   │   ├── security/
│   │   ├── autopilot/
│   │   └── ...
│   ├── autopilot/
│   ├── security/
│   ├── ...
│   └── page.tsx
│
├── lib/
│   ├── agent-roles.ts
│   ├── ai.ts
│   ├── autopilot.ts
│   ├── github-api.ts
│   ├── model-router.ts
│   ├── provider-gateway.ts
│   ├── security.ts
│   ├── patch-engine.ts
│   ├── orchestrator.ts
│   ├── tools.ts
│   └── ...
│
├── worker/
├── scripts/
├── cli/
├── docs/
│   └── screenshots/
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

# 🧩 Core Modules

## `lib/security.ts`

Contains the deterministic security scanning logic, finding grouping, scoring, and autonomy policy.

Responsibilities include:

```text
scanText()
scanPackageJson()
scanDockerfile()
groupFindings()
scoreFindings()
classifyRisk()
autonomyPolicy()
```

---

## `lib/patch-engine.ts`

Provides patch proposal generation and patch validation.

It understands supported remediation patterns and rejects obviously unsafe patch content.

---

## `lib/autopilot.ts`

Coordinates the guarded repository workflow:

```text
fetch
scan
patch
sandbox
approval
PR
```

It also creates the Git branch, commit tree, commit, and pull request after approval.

---

## `lib/github-api.ts`

Wraps GitHub REST API operations such as:

```text
repository information
branch references
commit information
repository tree
file content
branch creation
blob creation
tree creation
commit creation
ref update
pull request creation
```

---

## `lib/provider-gateway.ts`

Provides the provider abstraction.

It normalizes different AI APIs into one NEXUS interface.

It also handles:

```text
provider selection
fallback order
API configuration
OpenAI-compatible providers
Gemini requests
Anthropic requests
SSE response parsing
bounded output tokens
provider errors
```

---

## `lib/orchestrator.ts`

Coordinates specialist agents.

It:

1. loads active agents
2. scores agents against the task
3. selects specialists
4. chooses tools
5. executes tools
6. generates specialist responses
7. synthesizes the results

---

# 🌐 Useful NEXUS URLs

After starting the application:

```text
Main dashboard
http://localhost:3000

Security Autopilot
http://localhost:3000/autopilot

Security
http://localhost:3000/security

Agents
http://localhost:3000/agents

Models
http://localhost:3000/models

Health
http://localhost:3000/api/health

Providers
http://localhost:3000/api/providers
```

Exact route availability can depend on the current build.

---

# 🔌 Important API

## Repository security scan

Example:

```http
POST /api/security/repository
Content-Type: application/json
```

Body:

```json
{
  "owner": "Krishna-Gudavalli",
  "repo": "nexus-security-test",
  "branch": "main"
}
```

The response can contain:

```text
security score
risk level
findings
autonomy policy
analyzed files
grouped vulnerabilities
SBOM information
```

---

# 🧪 CLI

The project also includes:

```powershell
npm run nexus -- run "Calculate 18 * 7 + 4"
```

Security demo:

```powershell
npm run security:demo
```

Development:

```powershell
npm run dev
```

Production:

```powershell
npm run build
npm start
```

Lint:

```powershell
npm run lint
```

---

# 🧪 Build Verification

Run:

```powershell
npm run build
```

A successful Next.js build should complete compilation and TypeScript validation without errors.

If you encounter stale build artifacts:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm install
npm run build
```

---

# 🐳 Docker

Docker is optional.

Build/start:

```powershell
docker compose up --build
```

Optional infrastructure profile:

```powershell
docker compose --profile infra up -d postgres redis
```

The exact Docker configuration depends on the included compose files and environment configuration.

---

# 🧯 Troubleshooting

## `429` / quota / insufficient credits

This usually means the selected provider rejected the request because of rate limits, credits, quota, or billing state.

Use a fallback:

```env
AI_PROVIDER=omniroute
AI_FALLBACK_PROVIDERS=gemini,openrouter,ollama
```

or switch to another configured provider.

---

## `GEMINI_API_KEY is not configured`

Check:

```env
GEMINI_API_KEY=...
```

Then restart:

```powershell
npm run dev
```

Environment changes do not reliably apply to an already-running process.

---

## `OpenRouter is not configured`

Check:

```env
OPENROUTER_API_KEY=...
```

Also verify:

```env
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

---

## `OmniRoute unavailable`

Verify the gateway:

```powershell
curl http://localhost:20128/v1/models
```

If authentication is enabled:

```powershell
curl http://localhost:20128/v1/models -H "Authorization: Bearer YOUR_KEY"
```

Then confirm:

```env
OMNIROUTE_BASE_URL=http://localhost:20128/v1
OMNIROUTE_API_KEY=YOUR_KEY
OMNIROUTE_MODEL=auto
```

---

## `Ollama unavailable`

Check:

```powershell
ollama list
```

Then verify:

```text
http://localhost:11434
```

Pull the model:

```powershell
ollama pull llama3.2
```

---

## `Unexpected end of JSON input`

This generally indicates an upstream API returned an empty/non-standard response.

NEXUS's provider gateway attempts to handle JSON and SSE-style responses and reports provider-specific failures.

Check:

```text
/api/providers
```

and the terminal logs.

---

## GitHub `401` / `403`

Check:

```text
GITHUB_TOKEN
```

Then verify:

- token has not expired
- repository is included in the token
- required permissions are enabled
- organization approval is not blocking the token
- repository is accessible to the token owner

For PR creation, read-only permissions are not sufficient.

---

## Sandbox fails after a patch

Do not bypass the sandbox.

Inspect:

```text
sandbox.blocked
```

If the original finding remains, the correct behavior is to stop and fix the patch.

---

# 🔐 Security Best Practices

## 1. Never commit secrets

Use:

```text
.env.local
```

and keep it out of Git.

---

## 2. Use fake secrets for demos

Good:

```text
sk-test-example
```

Bad:

```text
real production API key
```

---

## 3. Use least privilege

Give GitHub access only to the repository and permissions NEXUS actually needs.

---

## 4. Keep OmniRoute local when possible

Use:

```text
localhost:20128
```

unless you have intentionally secured remote access.

---

## 5. Keep the approval gate

Do not remove the approval requirement just to make a demo look more autonomous.

The approval gate is part of the security architecture.

---

## 6. Treat AI-generated patches as untrusted

Even if the patch looks correct:

```text
AI proposal
   ↓
validation
   ↓
re-scan
   ↓
human review
```

is safer than:

```text
AI proposal
   ↓
direct commit
```

---

# ⚠️ What NEXUS Is Not

NEXUS is a portfolio/research engineering platform and should not be described as a complete replacement for:

- enterprise SAST
- enterprise DAST
- secret-management platforms
- dependency vulnerability databases
- penetration testing
- formal security review
- production change-management systems

Its goal is to demonstrate a strong architecture for **AI-assisted, guarded security remediation**.

---

# 🏆 Why This Project Is Interesting

NEXUS demonstrates several engineering concepts in one project:

### 🤖 AI Engineering

- specialist agents
- tool use
- multi-agent orchestration
- provider abstraction
- model routing
- fallback behavior

### 🛡️ Application Security

- SAST-style scanning
- secret detection
- injection detection
- CWE/OWASP mapping
- security scoring
- risk classification

### 🔧 Automated Remediation

- deterministic safe transformations
- patch proposals
- before/after changes
- patch validation
- re-scanning

### 🧪 Reliability

- bounded repository analysis
- provider error handling
- SSE parsing
- fallback providers
- sandbox gates

### 🐙 DevOps / GitHub Automation

- repository fetch
- branch creation
- Git object creation
- commits
- pull requests

### 👤 Responsible Autonomy

- human approval
- risk-aware policies
- blocked critical changes
- audit-style logs

---

# 🎬 Recommended Portfolio Demo Story

A strong video can tell this story in approximately 2–4 minutes:

## Scene 1 — Intro

Show:

```text
NEXUS
Agents that actually work.
```

Say:

> “NEXUS is an autonomous AI security and engineering platform that connects AI agents, GitHub, security scanning, safe remediation, validation, and pull requests.”

---

## Scene 2 — Agent System

Show:

```text
Researcher AI
Security AI
Fixer AI
```

Explain:

> “Instead of one generic AI, NEXUS separates repository research, security analysis, and remediation into specialist agents.”

---

## Scene 3 — Researcher Demo

Enter:

```text
18 * 7 + 4
```

Show:

```text
130
```

---

## Scene 4 — Security Demo

Show vulnerable code:

```js
eval(input);
element.innerHTML = userInput;
```

Run the scanner.

Show the findings.

---

## Scene 5 — Patch Engine

Show:

```text
eval → safe parser
innerHTML → textContent
secret → environment variable
```

---

## Scene 6 — GitHub Autopilot

Show:

```text
GitHub
 ↓
Scan
 ↓
Patch
 ↓
Sandbox
 ↓
Approval
 ↓
PR
```

---

## Scene 7 — Pull Request

Open GitHub and show the generated branch and pull request.

This is the strongest proof that the project is not merely a UI mockup.

---

# 📸 Included Screenshots

The repository includes the supplied NEXUS screenshots under:

```text
docs/screenshots/
```

Files:

```text
01-security-autopilot.png
02-command-center-agents.png
03-model-router.png
04-ai-specialists.png
05-security-command-center.png
06-security-scan-result.png
07-ai-patch-engine.png
08-researcher-ai-demo.png
```

These are useful for GitHub documentation, project presentations, and portfolio pages.

---

# 📚 Official Provider References

For current provider setup instructions, always prefer the provider's own documentation because API dashboards, model names, quotas, billing, and authentication flows can change.

### Google Gemini

https://ai.google.dev/gemini-api/docs/api-key

### OpenAI

https://platform.openai.com/docs/api-reference/

### Anthropic

https://docs.anthropic.com/

### OpenRouter

https://openrouter.ai/docs/quickstart

### Ollama

https://ollama.com/

### OmniRoute

https://github.com/CarlaSalles-AI/omniroute

### GitHub Personal Access Tokens

https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

---

# 📌 Quick Start Cheat Sheet

```powershell
# 1. Install dependencies
npm install

# 2. Create environment file
Copy-Item .env.example .env.local

# 3. Configure at least one AI provider
#    and GITHUB_TOKEN if using GitHub Autopilot

# 4. Start NEXUS
npm run dev

# 5. Open
# http://localhost:3000
```

For OmniRoute:

```powershell
npm install -g omniroute
omniroute
```

Then:

```env
AI_PROVIDER=omniroute
AI_FALLBACK_PROVIDERS=gemini,openrouter,ollama
OMNIROUTE_BASE_URL=http://localhost:20128/v1
OMNIROUTE_API_KEY=YOUR_OMNIROUTE_ENDPOINT_KEY
OMNIROUTE_MODEL=auto
```

For Gemini:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_GEMINI_KEY
GEMINI_MODEL=gemini-2.5-flash
```

For GitHub:

```env
GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

---

# 🏁 Final Project Summary

NEXUS 3.2.4 brings together:

```text
🔎 Research
+
🛡️ Security Analysis
+
🔧 Safe Remediation
+
🧪 Validation
+
🔀 AI Routing
+
🐙 GitHub Automation
+
👤 Human Approval
+
🔀 Pull Requests
```

The final architecture is built around one principle:

> **Automate aggressively where it is safe, and stop where human judgment is required.**

That makes NEXUS more than an AI demo.

It is a demonstration of how **AI agents, software security, controlled automation, provider abstraction, and modern Git workflows can work together in a single engineering platform.**

---

## 👨‍💻 Author

**Krishna Gudavalli**

GitHub:

https://github.com/Krishna-Gudavalli

NEXUS is built as a portfolio-grade demonstration of:

```text
Full-Stack Development
AI Engineering
Cybersecurity
Agentic Systems
Cloud/API Integration
GitHub Automation
Responsible AI Automation
```

⭐ If you found the project interesting, consider starring the repository and exploring the implementation.
