import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { TurnReservationService } from '../turn-reservation.service';
import { TurnEntity } from '../../entities/turn.entity';
import dataSource from '../../data-source';

// M1.1 (2026-08-13): the old version of this file mocked dataSource.query
// and asserted on the raw SQL string it was called with — it verified the
// mock, not the query. TODO.md M1.1 explicitly calls mock-based tests
// harmful here (the whole bug class was a raw-SQL column-name typo a mock
// can't catch) and asks for a real Postgres integration test instead. This
// runs the real QueryBuilder rewrite against the dev DB from `npm run db:up`.
describe('TurnReservationService (real Postgres)', () => {
  let ds: DataSource;
  let service: TurnReservationService;
  const userId = randomUUID();
  const chronicleId = randomUUID();

  beforeAll(async () => {
    ds = await dataSource.initialize();
    service = new TurnReservationService(ds);
  });

  afterAll(async () => {
    await ds.destroy();
  });

  afterEach(async () => {
    await ds.getRepository(TurnEntity).delete({ userId });
  });

  it('reserves a brand-new turnId', async () => {
    const turnId = randomUUID();

    const result = await service.reserve(turnId, userId, chronicleId);

    expect(result).not.toBeNull();
    expect(result!.turnId).toBe(turnId);
    expect(result!.status).toBe('reserved');
  });

  it('returns null on a second reservation of the same turnId (idempotency)', async () => {
    const turnId = randomUUID();
    await service.reserve(turnId, userId, chronicleId);

    const result = await service.reserve(turnId, userId, chronicleId);

    expect(result).toBeNull();
  });

  it('allows retry-after-failure: a failed turn can be re-reserved', async () => {
    const turnId = randomUUID();
    await service.reserve(turnId, userId, chronicleId);
    await ds.getRepository(TurnEntity).update({ turnId }, { status: 'failed' });

    const result = await service.reserve(turnId, userId, chronicleId);

    expect(result).not.toBeNull();
    expect(result!.status).toBe('reserved');
  });

  it('does not re-reserve a completed turn', async () => {
    const turnId = randomUUID();
    await service.reserve(turnId, userId, chronicleId);
    await ds.getRepository(TurnEntity).update({ turnId }, { status: 'completed' });

    const result = await service.reserve(turnId, userId, chronicleId);

    expect(result).toBeNull();
  });
});
