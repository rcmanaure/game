import { z } from "zod";

// Minimal JSON GameEvent shape for the harness. T1's full server-side rules
// validator (delta bounds, legal state transitions) is separate scope — this
// harness only checks schema validity (Decision #19's resolve->[retry-once]
// edge), not rules legality.
export const GameEventSchema = z.object({
  eventType: z.enum(["combat", "social", "exploration", "other"]),
  archetype: z.string().min(1), // Decision #6 taxonomy key, feeds art-trigger
  summary: z.string().min(1), // factual beat description, feeds narrate node
  statDeltas: z.record(z.string(), z.number()).optional(),
});
export type GameEvent = z.infer<typeof GameEventSchema>;

export const HarnessStateSchema = z.object({
  playerAction: z.string(),
  gameEvent: GameEventSchema.nullable().default(null),
  resolveRetried: z.boolean().default(false),
  narration: z.string().nullable().default(null),
  artUrl: z.string().nullable().default(null),
  artError: z.string().nullable().default(null),
});
export type HarnessState = z.infer<typeof HarnessStateSchema>;
