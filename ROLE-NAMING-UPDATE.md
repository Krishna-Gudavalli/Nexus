# 🎨 Agent Role Naming Update

The NEXUS UI now uses role-based identities throughout the main dashboard:

- 🔎 Researcher AI — Research & repository intelligence
- 🛡️ Security AI — Vulnerability detection & analysis
- 🔧 Fixer AI — Remediation & patch generation

The underlying provider/model string (for example `omniroute/gpt-4.1-mini`) is no longer used as the user-facing AI identity in generated answers.

Provider/model information remains available in the Model Router for technical inspection.
