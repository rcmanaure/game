import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../auth/roles.guard';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'varchar', default: UserRole.User })
  role!: UserRole;

  @Column({ type: 'uuid', nullable: true })
  activeChronicleId?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
