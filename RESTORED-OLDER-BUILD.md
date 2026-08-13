# NEXUS 3.2.3 — Restored Older Working Architecture

This release is based directly on the uploaded `NEXUS-FINAL-ALL-SECURITY-INTELLIGENCE-ULTIMATE` build.

The existing dashboard, agent OS, provider gateway, GitHub integration, guarded autopilot, security intelligence, sandbox gate, approval gate, branch/commit/PR flow, and documentation are preserved.

## Fixes in this release

- Restored the three-agent presentation on Security Autopilot:
  - Researcher AI
  - Security AI
  - Fixer AI
- Added a conservative SQL parameterized-query transformation for the exact `db.query("..." + username + "...")` pattern used by `nexus-security-test`.
- Added post-patch re-scan by finding group so an SQL injection finding must actually disappear before sandbox passes.
- Preserved human approval before any Git write.
- Preserved automatic branch, commit and PR creation after approval.
- Improved standalone `/api/patch` SQL proposal generation.
- Kept the existing provider abstraction and OmniRoute/OpenRouter/Gemini/Ollama architecture.
