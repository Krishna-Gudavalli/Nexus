# ⚡ Interactive NEXUS Autopilot

The Autopilot page is now a real guarded stage-by-stage workflow instead of decorative stage cards.

## Workflow

1. 🐙 **GitHub Fetch** — connects to the selected repository and loads bounded text files.
2. 🛡️ **Security Scan** — scans the fetched files and records findings.
3. 🔧 **AI Patch** — generates conservative automatic remediation candidates. Findings without a safe deterministic remediation remain manual.
4. 🧪 **Sandbox** — runs the static safety gate against proposed changes.
5. 👤 **Approval** — NEXUS stops before any Git write and waits for explicit approval.
6. 🔀 **Pull Request** — after approval, NEXUS creates a dedicated branch, commit, and pull request.

## Important behavior

- Each stage has a real backend API action.
- Stages are ordered and cannot be skipped by the API.
- The UI shows `READY`, `RUNNING`, `SUCCESS`, or `FAILED`.
- Stage results and logs are persisted in `data/autopilot-pipelines.json`.
- No Git branch, commit, or PR is created before approval.
- High-risk findings such as `eval()` intentionally do not receive a blind automatic rewrite. NEXUS reports that manual remediation is required unless a safe patch can be generated.

## Testing

Start NEXUS:

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:3000/autopilot
```

Enter a test repository, click **Create guarded pipeline**, and then run the stages from left to right.

For GitHub write operations, configure `GITHUB_TOKEN` with repository permissions for contents and pull requests.
