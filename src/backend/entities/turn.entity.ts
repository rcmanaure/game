import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

// Turn status lifecycle (eng review 2026-08-06 — status-column approach,
// not a long-held transaction spanning the LLM calls):
//
//   client submits turnId
//        │
//        ▼
//   reserve(): INSERT ... ON CONFLICT DO NOTHING
//        │            │
//   (0 rows) ◄────────┘
//        │
//        ▼
//   UPDATE ... WHERE status='failed' ... RETURNING  (retry-after-failure path)
//        │            │
//   (0 rows) ◄────────┘ — existing row is 'reserved' or 'completed', reject
//        │
//        ▼
//   status = 'reserved'  (fast, own transaction — commits immediately)
//        │
//        ▼
//   harnessGraph.invoke() runs with NO open DB transaction (slow LLM calls)
//        │
//        ├── success ──▶ fast transaction: status='completed' + persist result
//        │
//        └── failure ──▶ fast transaction: status='failed' (retryable)
//
// A crash mid-turn leaves status='reserved' — a startup sweep (see
// GraphService) flips stale 'reserved' rows to 'failed' after a timeout so
// the client's retry (same turnId, per the client-generated-UUID contract)
// isn't permanently stranded.
//
// turnId doubles as the LangGraph checkpointer's thread_id (Decision #21) —
// no separate mapping between the two idempotency mechanisms.
export const TURN_STATUSES = ['reserved', 'completed', 'failed'] as const;
export type TurnStatus = (typeof TURN_STATUSES)[number];

@Entity('turns')
export class TurnEntity {
  // Client-generated UUID (crypto.randomUUID() in the browser) — required
  // for retry-after-drop idempotency to work: a retry must resend the SAME
  // id, which only works if the client (not the server) generates it.
  @PrimaryColumn('uuid')
  turnId!: string;

  @Index()
  @Column()
  userId!: string;

  @Index()
  @Column()
  chronicleId!: string;

  @Column({ type: 'enum', enum: TURN_STATUSES, default: 'reserved' })
  status!: TurnStatus;

  @Column()
  playerAction!: string;

  // Populated on status='completed' only.
  @Column({ type: 'jsonb', nullable: true })
  gameEvent!: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  narration!: string | null;

  @Column({ type: 'text', nullable: true })
  artUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
