import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TurnEntity } from '../entities/turn.entity';

@Injectable()
export class TurnReservationService {
  constructor(private dataSource: DataSource) {}

  // Atomic reservation for idempotency. Returns the reserved turn row if successful
  // (new or retry-after-failure), null if already reserved/completed.
  // Eng review 2026-08-06: atomic INSERT/UPDATE...WHERE...RETURNING pattern, not SELECT-then-act.
  async reserve(turnId: string, userId: string, chronicleId: string): Promise<TurnEntity | null> {
    // Try brand-new turn first
    const result = await this.dataSource.query(
      `INSERT INTO turns (turn_id, user_id, chronicle_id, status, player_action, created_at)
       VALUES ($1, $2, $3, 'reserved', '', now())
       ON CONFLICT (turn_id) DO NOTHING
       RETURNING *`,
      [turnId, userId, chronicleId],
    );

    if (result.length > 0) {
      return result[0];
    }

    // Existing row — only reserve if it's in 'failed' state (retry-after-failure)
    const retryResult = await this.dataSource.query(
      `UPDATE turns
       SET status = 'reserved'
       WHERE turn_id = $1 AND user_id = $2 AND status = 'failed'
       RETURNING *`,
      [turnId, userId],
    );

    return retryResult.length > 0 ? retryResult[0] : null;
  }
}
