import { NextResponse } from "next/server";
import { scanText, scoreFindings, classifyRisk, autonomyPolicy } from "@/lib/security";

const demoSource = `const API_KEY = "sk-demo-secret-DO-NOT-USE";
export function executeUserInput(input) {
  return eval(input);
}
export function render(userInput) {
  element.innerHTML = userInput;
}
fetch("http://example.com/api");`;

export async function GET() {
  const findings = scanText(demoSource, "nexus-demo.js");
  const risk = classifyRisk(findings);
  return NextResponse.json({ mode: "demo", source: demoSource, score: scoreFindings(findings), risk, policy: autonomyPolicy(risk), findings });
}
