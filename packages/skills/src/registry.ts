import type { SkillManifest } from "@repo/core";

export class SkillRegistry {
  private readonly skills = new Map<string, SkillManifest>();

  register(skill: SkillManifest) {
    if (this.skills.has(skill.id)) {
      throw new Error(`Skill already registered: ${skill.id}`);
    }

    this.skills.set(skill.id, skill);
  }

  list(): SkillManifest[] {
    return [...this.skills.values()];
  }

  get(id: string): SkillManifest | undefined {
    return this.skills.get(id);
  }
}
