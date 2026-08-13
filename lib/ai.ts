import { ToolId } from "@/types/nexus";
import { routeModel } from "@/lib/model-router";
import { generateWithFallback } from "@/lib/provider-gateway";

type Message = { role: "system" | "user" | "assistant"; content: string };

function demoAnswer(task: string, agentName: string, toolOutputs: string[]) {
  const context = toolOutputs.length
    ? `\n\nTool evidence:\n${toolOutputs.map((x, i) => `${i + 1}. ${x}`).join("\n")}`
    : "";
  return `Demo-mode response from ${agentName}.\n\nTask: ${task}\n\nConfigure an AI provider to enable live model responses. NEXUS can use OpenAI, Gemini, Anthropic, OpenRouter, Ollama, or OmniRoute with automatic fallback.${context}`;
}

export async function generateAnswer(systemPrompt: string, task: string, toolOutputs: string[], agentName: string) {
  const hasAnyProvider = Boolean(
    process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY ||
    process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OMNIROUTE_API_KEY ||
    process.env.OLLAMA_BASE_URL || process.env.AI_PROVIDER === "ollama"
  );
  if (!hasAnyProvider) return demoAnswer(task, agentName, toolOutputs);

  const routed = process.env.AI_MODEL_ROUTING === "true" ? await routeModel(task) : undefined;
  const evidence = toolOutputs.length ? `\n\nTOOL EVIDENCE:\n${toolOutputs.join("\n\n---\n\n")}` : "";
  const messages: Message[] = [
    { role: "system", content: `${systemPrompt}\nYou are operating inside NEXUS. Be concise but useful. Never claim an action was completed unless evidence shows it was.` },
    { role: "user", content: `TASK:\n${task}${evidence}` }
  ];
  const result = await generateWithFallback(messages, messages[0].content, routed?.model);
  // Provider/model details stay in the technical layer. The user-facing identity is the specialist role.
  return result.text;
}

export function chooseTools(task: string, enabled: ToolId[]) {
  const lower = task.toLowerCase();
  const chosen: { tool: ToolId; input: string }[] = [];
  if (enabled.includes("github_repo")) {
    const match = task.match(/(?:github\.com\/)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/);
    if (match && (lower.includes("repo") || lower.includes("github") || match[1].includes("/"))) chosen.push({ tool: "github_repo", input: match[1] });
  }
  if (enabled.includes("calculator") && /calculate|compute|how much|percentage|%|\d+\s*[+\-*/]\s*\d+/.test(lower)) {
    const match = task.match(/([0-9][0-9+\-*/().%\s]{2,})/);
    if (match) chosen.push({ tool: "calculator", input: match[1].trim() });
  }
  if (enabled.includes("current_time") && /time|date|today|now/.test(lower)) chosen.push({ tool: "current_time", input: "" });
  if (enabled.includes("web_search") && /search|latest|recent|news|research|find/.test(lower)) chosen.push({ tool: "web_search", input: task });
  return chosen.slice(0, 3);
}
