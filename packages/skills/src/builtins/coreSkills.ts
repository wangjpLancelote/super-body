import type { Skill } from "../types";

export const chatSkill: Skill = {
  id: "chat",
  name: "Chat",
  description: "Core conversation and response generation.",
  enabled: true,
  tools: [],
  sourcePath: "builtin:chat",
  body: "This is the chat skill.",
};

export const webResearchSkill: Skill = {
  id: "web-research",
  name: "Web Research",
  description:
    "Search the web and read webpages for factual or recent information.",
  enabled: true,
  tools: ["web_search", "fetch_url"],
  sourcePath: "builtin:web-research",
  body: "This is the web research skill.",
};

export const memorySkill: Skill = {
  id: "memory",
  name: "Memory",
  description:
    "Capture useful facts, preferences, and open loops into assistant memory.",
  enabled: true,
  tools: [],
  sourcePath: "builtin:memory",
  body: "This is the memory skill.",
};

export const coreSkills: Skill[] = [chatSkill, webResearchSkill, memorySkill];
