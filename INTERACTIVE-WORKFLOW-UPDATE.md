# 🚀 Interactive Workflow Update

## Fixed

The GitHub Fetch, Security Scan, AI Patch, and Sandbox cards are now real interactive controls.

Previously they were visual stage cards, so clicking them produced no network request. The updated Autopilot page calls:

- `POST /api/autopilot` — create a guarded pipeline
- `POST /api/autopilot/[id]/stage` — execute a specific guarded stage
- `POST /api/autopilot/[id]` — approve and create the GitHub PR

The frontend now displays live stage status and detailed stage results.
