import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TurnEntity } from '../entities/turn.entity';

@Injectable()
export class TurnReservationService {
  constructor(private dataSource: DataSource) {}

  // Atomic reservation for idempotency. Returns the reserved turn row if successful
  // (new or retry-after-failure), null if already reserved/completed.
  // Eng review 2026-08-06: atomic INSERT/UPDATE...WHERE...RETURNING pattern, not SELECT-then-act.
  // QueryBuilder generates column names from the entity, so this can't drift
  // out of sync with the migration's quoted camelCase columns the way the
  // old hand-written SQL did (TODO.md M1.1).
  async reserve(turnId: string, userId: string, chronicleId: string): Promise<TurnEntity | null> {
    // Try brand-new turn first
    const inserted = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(TurnEntity)
      .values({ turnId, userId, chronicleId, status: 'reserved', playerAction: '' })
      .orIgnore()
      .returning('*')
      .execute();

    if (inserted.raw.length > 0) {
      return inserted.raw[0];
    }

    // Existing row — only reserve if it's in 'failed' state (retry-after-failure)
    const retried = await this.dataSource
      .createQueryBuilder()
      .update(TurnEntity)
      .set({ status: 'reserved' })
      .where('turnId = :turnId AND userId = :userId AND status = :from', {
        turnId,
        userId,
        from: 'failed',
      })
      .returning('*')
      .execute();

    return retried.raw.length > 0 ? retried.raw[0] : null;
  }
}
