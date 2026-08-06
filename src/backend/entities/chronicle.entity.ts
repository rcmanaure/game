import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// Groups a user's Turns and Npcs for one playthrough. Recall (T19) queries
// Npc rows scoped to a user's PRIOR chronicles, distinct from turns within
// the CURRENT chronicle -- this entity is what makes that boundary real
// instead of implicit.
@Entity('chronicles')
export class ChronicleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @CreateDateColumn()
  startedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt!: Date | null;
}
