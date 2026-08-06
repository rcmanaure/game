import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// T19 recall node's persisted NPC/consequence record. Queried by userId
// ONLY (never a request param — per-user JWT-scoped access, same IDOR
// guard as every other save/chronicle endpoint, Foundational Decision on
// per-user scoping) so one player's NPCs never surface in another's game.
//
// hp/maxHp added (eng review 2026-08-06) so rules.ts's `statDeltas.targetHp`
// — computed on every successful attack but previously discarded — has
// somewhere to apply. Not every encounter targets a persisted Npc (one-off
// monsters can stay ephemeral); rulesValidate only applies targetHp when
// the resolved event's target is a real, persisted Npc row.
@Entity('npcs')
export class NpcEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Column()
  chronicleId!: string;

  @Column()
  name!: string;

  // Short factual callback line surfaced in the recall node's opening
  // narration beat (e.g. "the blackmailer from your last run").
  @Column({ type: 'text' })
  fact!: string;

  @Column({ type: 'varchar', nullable: true })
  bloodline!: string | null;

  @Column({ type: 'int' })
  hp!: number;

  @Column({ type: 'int' })
  maxHp!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
