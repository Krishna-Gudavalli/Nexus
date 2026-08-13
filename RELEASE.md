# NEXUS Final Release

## Included

- Responsive AI agent command center
- Agent creation and deletion
- Specialized default agents
- Explicit tool registry
- GitHub repository inspection
- Calculator
- Current-time tool
- Optional Tavily web search
- OpenAI-compatible provider support
- Gemini REST support
- Execution traces
- Persistent run history
- Local JSON persistence
- Demo mode without an AI key
- Docker / Docker Compose
- Production build configuration
- Environment template
- Safety boundary: no arbitrary shell execution

## Final verification checklist

After extraction:

```powershell
npm install
npm run build
npm run dev
```

Then visit `http://localhost:3000`.

For Docker:

```powershell
docker compose up --build
```

The app intentionally requires no database server for the final local package. Runtime state is stored in `data/` and can be replaced with PostgreSQL/Redis later without changing the UI contract.
