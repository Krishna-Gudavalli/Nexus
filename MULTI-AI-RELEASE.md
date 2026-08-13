# 🔀 NEXUS Multi-AI Release

This release adds a provider abstraction and fallback gateway for OpenAI, Gemini, Anthropic, OpenRouter, Ollama, and OmniRoute.

## Key environment variables

- `AI_PROVIDER`
- `AI_FALLBACK_PROVIDERS`
- `AI_MODEL_ROUTING`
- `OMNIROUTE_BASE_URL`
- `OMNIROUTE_API_KEY`
- `OMNIROUTE_MODEL`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENROUTER_API_KEY`
- `OLLAMA_BASE_URL`
- `OLLAMA_MODEL`

## New endpoint

`GET /api/providers` returns safe provider status and routing order without exposing secrets.

## Fallback semantics

NEXUS attempts the configured primary provider and then the configured fallback providers in order. Provider errors are captured and the next provider is attempted. If all fail, NEXUS returns a combined diagnostic error.

### 💳 OmniRoute/OpenRouter 402 errors

If OmniRoute reports `402 payment_required` and says the request asks for 65536 tokens, NEXUS is now configured to cap OpenAI-compatible requests with `NEXUS_MAX_OUTPUT_TOKENS=2048` by default. You can lower or raise this between 256 and 8192. A 402 can still occur if the underlying provider has insufficient credits; in that case configure a fallback provider with its own API key or add credits to the provider used by OmniRoute.

### 🦙 Ollama fallback

`ollama: fetch failed` means the local Ollama server is not running or is unreachable. Start Ollama and make sure a model is installed before including `ollama` in `AI_FALLBACK_PROVIDERS`.
