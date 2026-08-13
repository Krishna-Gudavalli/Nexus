import { promises as fs } from "fs";
import path from "path";
import { Agent, Run } from "@/types/nexus";

const dataDir = path.join(process.cwd(), "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(dataDir, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(path.join(dataDir, file), JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, file), JSON.stringify(value, null, 2));
}

export async function getAgents() {
  return readJson<Agent[]>("agents.json", []);
}

export async function saveAgents(agents: Agent[]) {
  await writeJson("agents.json", agents);
}

export async function getRuns() {
  return readJson<Run[]>("runs.json", []);
}

export async function saveRuns(runs: Run[]) {
  await writeJson("runs.json", runs.slice(0, 100));
}
