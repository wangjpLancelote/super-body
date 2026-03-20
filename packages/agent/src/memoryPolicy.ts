import type {
  MemoryPatch,
  MemoryPolicyInput,
  MemoryPolicyConfig,
} from "@repo/core";

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function alreadyContains(memory: string, value: string) {
  return normalize(memory).includes(normalize(value));
}

export function buildMemoryPatches(
  input: MemoryPolicyInput,
  config: MemoryPolicyConfig,
): MemoryPatch[] {
  const patches: MemoryPatch[] = [];
  const text = input.message.text.trim();

  if (config.captureRecentInteractions) {
    patches.push({
      section: "Recent Interactions",
      content: `${input.message.timestamp} | ${input.message.userId} | ${text}`,
    });
  }

  if (
    config.capturePreferences &&
    /i prefer|my preference is|prefer /i.test(text)
  ) {
    if (!alreadyContains(input.currentMemory, text)) {
      patches.push({
        section: "Preferences",
        content: text,
      });
    }
  }

  if (
    config.captureFacts &&
    /my name is |i am |i work as |i live in /i.test(text)
  ) {
    if (!alreadyContains(input.currentMemory, text)) {
      patches.push({
        section: "Facts",
        content: text,
      });
    }
  }

  if (
    config.captureOpenLoops &&
    /remind me to|todo|to-do|i need to|i should /i.test(text)
  ) {
    if (!alreadyContains(input.currentMemory, text)) {
      patches.push({
        section: "Open Loops",
        content: text,
      });
    }
  }

  return patches;
}
