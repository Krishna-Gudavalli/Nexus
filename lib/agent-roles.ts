export type NexusAgentRole = "researcher" | "security" | "fixer";

export type NexusAgentRoleMeta = {
  role: NexusAgentRole;
  label: string;
  icon: string;
  shortPurpose: string;
  description: string;
};

export const NEXUS_AGENT_ROLES: Record<NexusAgentRole, NexusAgentRoleMeta> = {
  researcher: {
    role: "researcher",
    label: "Researcher AI",
    icon: "🔎",
    shortPurpose: "Research & repository intelligence",
    description: "Investigates repositories, gathers evidence, and builds reliable context before action.",
  },
  security: {
    role: "security",
    label: "Security AI",
    icon: "🛡️",
    shortPurpose: "Vulnerability detection & analysis",
    description: "Finds security weaknesses, explains risk, and recommends safe remediation.",
  },
  fixer: {
    role: "fixer",
    label: "Fixer AI",
    icon: "🔧",
    shortPurpose: "Remediation & patch generation",
    description: "Turns validated security findings into focused, testable remediation proposals.",
  },
};

export function getAgentRole(agent: { id?: string; name?: string }): NexusAgentRoleMeta {
  const id = (agent.id || "").toLowerCase();
  const name = (agent.name || "").toLowerCase();
  if (id.includes("research") || name.includes("research")) return NEXUS_AGENT_ROLES.researcher;
  if (id.includes("security") || name.includes("security")) return NEXUS_AGENT_ROLES.security;
  if (id.includes("fix") || id.includes("dev") || name.includes("fix") || name.includes("devops") || name.includes("developer")) return NEXUS_AGENT_ROLES.fixer;
  return NEXUS_AGENT_ROLES.fixer;
}

export function getAgentDisplayName(agent: { id?: string; name?: string }) {
  return getAgentRole(agent).label;
}
