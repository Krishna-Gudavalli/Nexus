# NEXUS 3.2.4 — Autonomous Remediation Fix

## Fixed

- Fixed Sandbox 400 failures caused by incomplete secret remediation.
- Added remediation for both API credentials and password/database-password properties.
- Added `innerHTML` → `textContent` safe remediation for simple HTML injection sinks.
- Improved constrained `eval()` replacement for arithmetic expressions.
- Added up to 3 deterministic remediation passes before Sandbox validation.
- Sandbox continues to block Git writes whenever any original finding remains.
- Fixed TypeScript typing in `lib/security.ts`.
- Fixed `context()` typing in the security scanner.
- Fixed OmniRoute/OpenAI-compatible SSE result typing in `lib/provider-gateway.ts`.
- Preserved mandatory human approval before branch/commit/PR creation.

## Expected test

For a repository containing:

- `eval(expression)`
- hardcoded `apiKey`
- hardcoded `databasePassword`
- `element.innerHTML = ...`

NEXUS should generate safe changes, re-scan them, and only move to Approval when the remaining finding count is zero.

## Secret environment variables

```env
NEXUS_SECRET=your_secret
NEXUS_DB_PASSWORD=your_database_password
```

Never commit `.env.local` or real credentials.
