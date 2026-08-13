# NEXUS — All Phases Complete

This release consolidates the NEXUS security platform roadmap into one runnable build.

## Included

- 🔎 Researcher AI / 🛡️ Security AI / 🔧 Fixer AI role-based UI
- 🔀 OmniRoute/provider abstraction + fallback routing
- 🐙 GitHub fetch → security scan → safe patch → sandbox → approval → branch → commit → PR
- 🛡️ SAST checks for dynamic execution, process execution, injection sinks, HTML sinks and unsafe URLs
- 🔐 Secret detection for GitHub/OpenAI-style keys, cloud credential patterns and private keys
- 📦 Dependency manifest hygiene checks + lightweight SBOM inventory
- 🐳 Dockerfile security checks
- 📊 Security score and severity summary
- 🧠 Risk-based autonomy policy: critical blocks, high/medium require guarded human approval, low remains review-only
- 🧪 Sandbox static safety gate and re-scan
- 👤 Human approval before Git writes
- 📝 Detailed PR summary with validation information
- 🧾 Pipeline/audit log
- 🎮 Built-in Security Demo Mode
- 📈 AI evaluation lab, memory, knowledge/RAG, schedules, workflows, MCP registry and model router

## Demo

Open the **Security** tab and click **Load security demo**, then **Scan code**.

For a real repository use the **GitHub repository intelligence** panel and enter an owner/repository.

## End-to-end test

Use a test repository containing `vulnerable.js` with `eval(input)`, then open `/autopilot` and run:

1. GitHub Fetch
2. Security Scan
3. AI Patch
4. Sandbox
5. Human approval
6. Create Pull Request

Never use real secrets in a demo repository.
