import { z } from "zod";

// Attribute names, kept generic-English (Strength/Charisma etc. aren't VTM
// IP — Decision #1 only bars VTM's proprietary lore terms like "Kindred").
// Exact scale/naming is an open design question per the RPG-mechanics
// research (2026-08-05) finding #6 — this is a first-pass placeholder set,
// not a locked decision.
export const ATTRIBUTES = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
] as const;
export type Attribute = (typeof ATTRIBUTES)[number];

export const SkillSchema = z.object({
  attribute: z.enum(ATTRIBUTES),
  proficient: z.boolean(), // adds a flat proficiency bonus, D&D SRD 5.1 p.76
});
export type Skill = z.infer<typeof SkillSchema>;

// Decision #5's coterie-member lifecycle (Active -> Torpor -> Dead), the
// state T1's rules-validator exists to gate transitions between.
export const CHARACTER_STATUSES = ["active", "torpor", "dead"] as const;
export const CharacterStatusSchema = z.enum(CHARACTER_STATUSES);
export type CharacterStatus = z.infer<typeof CharacterStatusSchema>;

// zod-defined (not just a TS interface) so it can be threaded through the
// LangGraph StateGraph's state (T1's rules-validator needs to carry the
// mutated character forward from `rulesValidate` to whatever fires next).
export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  attributeModifiers: z.record(z.enum(ATTRIBUTES), z.number()), // -5..+10, D&D SRD 5.1 p.76 range
  skills: z.record(z.string(), SkillSchema),
  proficiencyBonus: z.number(),
  hp: z.number(),
  maxHp: z.number(),
  craving: z.number(), // 0-5, VTM V5's Hunger — the Craving's substrate
  status: CharacterStatusSchema,
});
export type Character = z.infer<typeof CharacterSchema>;

const ATTR_MOD_MIN = -5;
const ATTR_MOD_MAX = 10;

// Server-side bound, never trust an LLM-claimed modifier — this is exactly
// the "delta bounds per stat" gate Decision #7 describes.
export function clampAttributeModifier(mod: number): number {
  return Math.max(ATTR_MOD_MIN, Math.min(ATTR_MOD_MAX, mod));
}

/**
 * The character's REAL modifier for a check, looked up server-side.
 * The resolve node's LLM only names which attribute/skill applies — it
 * never supplies the modifier value itself.
 */
export function modifierFor(
  character: Character,
  attribute: Attribute,
  skillName: string | null,
): number {
  const attrMod = clampAttributeModifier(
    character.attributeModifiers[attribute] ?? 0,
  );
  if (!skillName) return attrMod;
  const skill = character.skills[skillName];
  if (!skill || skill.attribute !== attribute) return attrMod; // unknown/mismatched skill grants no bonus
  return attrMod + (skill.proficient ? character.proficiencyBonus : 0);
}

// A couple of sample characters for harness testing — not the real roster
// (Decision #23's predefined-character content is a separate, later task).
export const SAMPLE_CHARACTERS: Record<string, Character> = {
  "mira-ashgrave": {
    id: "mira-ashgrave",
    name: "Mira Ashgrave",
    attributeModifiers: {
      strength: 1,
      dexterity: 3,
      constitution: 2,
      intelligence: 0,
      wisdom: 1,
      charisma: 4,
    },
    skills: {
      persuasion: { attribute: "charisma", proficient: true },
      stealth: { attribute: "dexterity", proficient: true },
      athletics: { attribute: "strength", proficient: false },
    },
    proficiencyBonus: 2,
    hp: 12,
    maxHp: 12,
    craving: 1,
    status: "active",
  },
  "toren-vale": {
    id: "toren-vale",
    name: "Toren Vale",
    attributeModifiers: {
      strength: 4,
      dexterity: 1,
      constitution: 3,
      intelligence: 0,
      wisdom: 0,
      charisma: 1,
    },
    skills: {
      athletics: { attribute: "strength", proficient: true },
      intimidation: { attribute: "charisma", proficient: false },
    },
    proficiencyBonus: 2,
    hp: 16,
    maxHp: 16,
    craving: 0,
    status: "active",
  },
};
