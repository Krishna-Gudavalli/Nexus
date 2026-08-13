export type AIProviderId = "openai" | "gemini" | "anthropic" | "openrouter" | "ollama" | "omniroute";

export type ProviderConfig = {
  id: AIProviderId;
  label: string;
  baseUrl: string;
  apiKeyConfigured: boolean;
  enabled: boolean;
  model: string;
};

export type ProviderResult = {
  provider: AIProviderId;
  model: string;
  text: string;
  latencyMs: number;
};

const DEFAULTS: Record<AIProviderId, { label: string; baseUrl: string; model: string; key: string }> = {
  openai: { label: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4.1-mini", key: "OPENAI_API_KEY" },
  gemini: { label: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta", model: "gemini-2.5-flash", key: "GEMINI_API_KEY" },
  anthropic: { label: "Anthropic", baseUrl: "https://api.anthropic.com/v1", model: "claude-3-5-haiku-latest", key: "ANTHROPIC_API_KEY" },
  openrouter: { label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-4o-mini", key: "OPENROUTER_API_KEY" },
  ollama: { label: "Ollama", baseUrl: "http://localhost:11434/v1", model: "llama3.2", key: "" },
  omniroute: { label: "OmniRoute", baseUrl: "http://localhost:20128/v1", model: "auto", key: "OMNIROUTE_API_KEY" }
};

function env(name: string) {
  const value = process.env[name];
  return value?.trim() || "";
}

function configFor(id: AIProviderId): ProviderConfig {
  const d = DEFAULTS[id];
  const baseEnv = {
    openai: "OPENAI_BASE_URL",
    gemini: "GEMINI_BASE_URL",
    anthropic: "ANTHROPIC_BASE_URL",
    openrouter: "OPENROUTER_BASE_URL",
    ollama: "OLLAMA_BASE_URL",
    omniroute: "OMNIROUTE_BASE_URL"
  }[id];
  const modelEnv = {
    openai: "OPENAI_MODEL",
    gemini: "GEMINI_MODEL",
    anthropic: "ANTHROPIC_MODEL",
    openrouter: "OPENROUTER_MODEL",
    ollama: "OLLAMA_MODEL",
    omniroute: "OMNIROUTE_MODEL"
  }[id];
  const key = d.key ? env(d.key) : "";
  return { id, label: d.label, baseUrl: env(baseEnv) || d.baseUrl, apiKeyConfigured: Boolean(key), enabled: id === "ollama" ? true : Boolean(key), model: env(modelEnv) || d.model };
}

export function getProviderConfigs(): ProviderConfig[] {
  return (Object.keys(DEFAULTS) as AIProviderId[]).map(configFor);
}

export function configuredProviderOrder(): AIProviderId[] {
  const primary = (env("AI_PROVIDER") || "openai") as AIProviderId;
  const fallbacks = (env("AI_FALLBACK_PROVIDERS") || "").split(",").map((x:string) => x.trim()).filter(Boolean) as AIProviderId[];
  const requested = [primary, ...fallbacks];
  return [...new Set(requested)].filter(id => id in DEFAULTS);
}

function cleanBase(url: string) { return url.replace(/\/$/, ""); }

async function parseJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text.trim()) throw new Error("Provider returned an empty response.");
  try { return JSON.parse(text) as Record<string, unknown>; }
  catch { throw new Error(`Provider returned non-JSON data: ${text.slice(0, 500)}`); }
}

/**
 * OmniRoute/OpenRouter can return Server-Sent Events even when an upstream
 * provider is configured for streaming. NEXUS agent calls are non-streaming,
 * but we still parse SSE defensively so a router cannot break the agent.
 */
function extractSseText(raw: string): string {
  const chunks: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(":")) continue;
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const item = JSON.parse(payload) as Record<string, unknown>;
      const choices = Array.isArray(item.choices) ? item.choices : [];
      const first = choices[0] as Record<string, unknown> | undefined;
      const delta = first?.delta as Record<string, unknown> | undefined;
      const content = delta?.content;
      if (typeof content === "string") chunks.push(content);
      else if (Array.isArray(content)) {
        for (const part of content) {
          if (typeof part === "object" && part !== null && "text" in part) {
            chunks.push(String((part as { text?: unknown }).text ?? ""));
          }
        }
      }
      const message = first?.message as Record<string, unknown> | undefined;
      if (typeof message?.content === "string") chunks.push(message.content);
    } catch {
      // Ignore router status/preamble lines and malformed SSE records.
    }
  }
  const text = chunks.join("");
  if (!text.trim()) throw new Error(`Provider returned SSE data but no text content: ${raw.slice(0, 500)}`);
  return text;
}

async function parseJsonOrSse(response: Response): Promise<Record<string, unknown> | { __sseText: string }> {
  const text = await response.text();
  if (!text.trim()) throw new Error("Provider returned an empty response.");
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/event-stream") || /(^|\n)\s*data:\s*\{/.test(text)) {
    return { __sseText: extractSseText(text) };
  }
  try { return JSON.parse(text) as Record<string, unknown>; }
  catch {
    // Some routers prepend informational lines before SSE records without
    // setting the content-type. Detect and parse those defensively.
    if (text.includes("data:") && text.includes("chat.completion.chunk")) {
      return { __sseText: extractSseText(text) };
    }
    throw new Error(`Provider returned non-JSON data: ${text.slice(0, 500)}`);
  }
}

async function openAICompatible(id: AIProviderId, messages: Message[], model: string, baseUrl: string, apiKey: string): Promise<string> {
  // Keep output requests bounded so hosted routers/providers do not reject
  // otherwise-valid requests because the model advertises a huge context.
  const maxTokens = Math.max(256, Math.min(8192, Number.parseInt(env("NEXUS_MAX_OUTPUT_TOKENS") || "2048", 10) || 2048));
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const response = await fetch(`${cleanBase(baseUrl)}/chat/completions`, {
    method: "POST", headers,
    // Normal NEXUS agent calls do not need token-by-token streaming. Some
    // routers ignore this flag, so parseJsonOrSse below still handles SSE.
    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: maxTokens, stream: false }), cache: "no-store"
  });
  if (!response.ok) throw new Error(`${id} returned ${response.status}: ${(await response.text()).slice(0, 1200)}`);
  const data = await parseJsonOrSse(response);
  const sseText = (data as { __sseText?: unknown }).__sseText;
  if (typeof sseText === "string") return sseText;
  const jsonData = data as Record<string, unknown>;
  const choices = Array.isArray(jsonData.choices) ? jsonData.choices : [];
  const first = choices[0] as Record<string, unknown> | undefined;
  const message = first?.message as Record<string, unknown> | undefined;
  const content = message?.content;
  if (typeof content === "string" && content.trim()) return content;
  if (Array.isArray(content)) return content.map(x => typeof x === "object" && x !== null && "text" in x ? String((x as { text?: unknown }).text ?? "") : "").join("");
  throw new Error(`${id} returned no text content.`);
}

async function gemini(messages: Message[], model: string, baseUrl: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
  const response = await fetch(`${cleanBase(baseUrl)}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }), cache: "no-store"
  });
  if (!response.ok) throw new Error(`Gemini returned ${response.status}: ${(await response.text()).slice(0, 1200)}`);
  const data = await parseJson(response);
  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  const content = candidates[0] as Record<string, unknown> | undefined;
  const body = content?.content as Record<string, unknown> | undefined;
  const parts = Array.isArray(body?.parts) ? body.parts : [];
  const text = parts.map(p => typeof p === "object" && p !== null && "text" in p ? String((p as { text?: unknown }).text ?? "") : "").join("");
  if (!text.trim()) throw new Error("Gemini returned no text content.");
  return text;
}

async function anthropic(messages: Message[], model: string, baseUrl: string, apiKey: string, systemPrompt: string): Promise<string> {
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");
  const response = await fetch(`${cleanBase(baseUrl)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 2048, system: systemPrompt, messages: messages.filter(m => m.role !== "system").map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })) }),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Anthropic returned ${response.status}: ${(await response.text()).slice(0, 1200)}`);
  const data = await parseJson(response);
  const content = Array.isArray(data.content) ? data.content : [];
  const text = content.map(x => typeof x === "object" && x !== null && "text" in x ? String((x as { text?: unknown }).text ?? "") : "").join("");
  if (!text.trim()) throw new Error("Anthropic returned no text content.");
  return text;
}

type Message = { role: "system" | "user" | "assistant"; content: string };

async function callProvider(id: AIProviderId, messages: Message[], systemPrompt: string, modelOverride?: string): Promise<ProviderResult> {
  const config = configFor(id);
  if (!config.enabled && id !== "ollama") throw new Error(`${config.label} is not configured. Set ${id === "openai" ? "OPENAI_API_KEY" : id === "gemini" ? "GEMINI_API_KEY" : id === "anthropic" ? "ANTHROPIC_API_KEY" : id === "openrouter" ? "OPENROUTER_API_KEY" : "OMNIROUTE_API_KEY"}.`);
  const started = Date.now();
  const key = id === "openai" ? env("OPENAI_API_KEY") || env("AI_API_KEY") : id === "gemini" ? env("GEMINI_API_KEY") || (env("AI_PROVIDER") === "gemini" ? env("AI_API_KEY") : "") : id === "anthropic" ? env("ANTHROPIC_API_KEY") : id === "openrouter" ? env("OPENROUTER_API_KEY") : id === "omniroute" ? env("OMNIROUTE_API_KEY") : "";
  const model = modelOverride || config.model;
  const text = id === "gemini"
    ? await gemini(messages, model, config.baseUrl, key)
    : id === "anthropic"
      ? await anthropic(messages, model, config.baseUrl, key, systemPrompt)
      : await openAICompatible(id, messages, model, config.baseUrl, key);
  return { provider: id, model, text, latencyMs: Date.now() - started };
}

export async function generateWithFallback(messages: Message[], systemPrompt: string, modelOverride?: string): Promise<ProviderResult> {
  const order = configuredProviderOrder();
  if (!order.length) throw new Error("No AI providers are configured.");
  const failures: string[] = [];
  for (const id of order) {
    try { return await callProvider(id, messages, systemPrompt, modelOverride); }
    catch (error) { failures.push(`${id}: ${(error as Error).message}`); }
  }
  throw new Error(`All configured AI providers failed.\n${failures.join("\n")}`);
}
