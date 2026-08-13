# 📡 OmniRoute/OpenRouter SSE Fix

NEXUS agent calls now explicitly request `stream: false` for OpenAI-compatible providers. This keeps ordinary agent responses simple and reduces provider-side surprises.

NEXUS also defensively parses Server-Sent Events (SSE) if OmniRoute or an upstream provider returns a streaming response anyway. It extracts `choices[].delta.content` chunks and combines them into one normal assistant response.

This fixes errors such as:

```text
Provider returned non-JSON data: OPENROUTER PROCESSING
data: {"object":"chat.completion.chunk", ...}
```

The existing `NEXUS_MAX_OUTPUT_TOKENS` safeguard remains enabled, defaulting to 2048 tokens.
