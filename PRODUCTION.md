# NEXUS Production Hardening

Recommended topology: Next.js web/API + PostgreSQL/pgvector + Redis worker + GitHub App/webhooks + OIDC + isolated code-execution worker + OpenTelemetry + object storage.

GitHub OAuth is available at `/api/github/oauth` after configuring the GitHub client credentials. Webhooks are verified with `GITHUB_WEBHOOK_SECRET`.

The included security scanner is a lightweight preflight layer. For authoritative CI security, add CodeQL/Semgrep/Trivy/OSV-Scanner and secrets scanning.

NEXUS deliberately exposes no arbitrary shell endpoint. Any code execution should run in a separate container with CPU/memory/time limits, network policy, allowlists and ephemeral storage.
