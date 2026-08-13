import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { GraphService } from '../graph.service';
import { TurnReservationService } from '../turn-reservation.service';
import { TurnEntity } from '../../entities/turn.entity';
import { NpcEntity } from '../../entities/npc.entity';
import { ChronicleEntity } from '../../entities/chronicle.entity';

// M3.2 (2026-08-13): this file previously mocked `runTurn` — the method
// under test — via jest.spyOn(service, 'runTurn').mockImplementationOnce,
// which replaces the code being tested rather than exercising it. Two
// adjacent tests had no assertions at all. Rewritten to test the parts of
// GraphService reachable WITHOUT mocking the dynamic `import()` of the
// ESM-only harness module (src/harness/graph.ts, no CJS build) — that
// boundary is real and load-bearing (see CHANGELOG [0.1.1.0], M1.6), and
// mocking a dynamic import cleanly under ts-jest's CJS transform is its
// own scoped problem, not squeezed into this pass. What's covered here:
// the reservation-fail short-circuit and the chronicle-already-ended
// pre-check (both testable via jest.spyOn on real dependencies, no
// harness import touched) plus onModuleInit's stale-turn sweep.

describe('GraphService', () => {
  let service: GraphService;
  let chronicleRepo: Repository<ChronicleEntity>;
  let turnRepo: Repository<TurnEntity>;
  let reservationService: TurnReservationService;

  beforeEach(async () => {
    // GraphService's constructor calls dataSource.getRepository() directly
    // (T19d recall + the rest of runTurn resolve their repos this way, not
    // via @InjectRepository — see app.module.ts's comment on why). That
    // constructor runs during compile(), so the routing must exist BEFORE
    // compile() — a jest.spyOn attached after compile() is too late, the
    // instance has already captured whatever getRepository returned then.
    chronicleRepo = { findOne: jest.fn().mockResolvedValue(null) } as any;
    turnRepo = { update: jest.fn().mockResolvedValue(undefined), findOne: jest.fn() } as any;
    const npcRepo = { findOne: jest.fn() } as any;
    const getRepository = jest.fn((entity: any) => {
      if (entity === ChronicleEntity) return chronicleRepo;
      if (entity === TurnEntity) return turnRepo;
      if (entity === NpcEntity) return npcRepo;
      return {};
    });

    const module = await Test.createTestingModule({
      providers: [
        GraphService,
        TurnReservationService,
        {
          provide: DataSource,
          useValue: {
            getRepository,
            query: jest.fn(),
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GraphService>(GraphService);
    reservationService = module.get<TurnReservationService>(TurnReservationService);
  });

  const input = {
    turnId: 'turn-123',
    userId: 'user-456',
    chronicleId: 'chronicle-789',
    playerAction: 'I cast fireball',
    character: {
      id: 'mira-ashgrave',
      name: 'Mira',
      hp: 10,
      maxHp: 10,
      craving: 0,
      proficiencyBonus: 2,
      status: 'active',
      attributeModifiers: { strength: 10, dexterity: 14 },
      skills: {},
    },
  };

  describe('runTurn', () => {
    it('rejects with chronicleAlreadyEnded when the chronicle has ended (M2.5)', async () => {
      jest.spyOn(chronicleRepo, 'findOne').mockResolvedValueOnce({
        id: input.chronicleId,
        userId: input.userId,
        endedAt: new Date('2026-08-13T00:00:00Z'),
      } as ChronicleEntity);

      const result = await service.runTurn(input);

      expect(result.success).toBe(false);
      expect(result.chronicleAlreadyEnded).toBe(true);
      expect(result.error).toBe('This chronicle has ended');
    });

    it('checks the chronicle BEFORE reserving the turn — an ended chronicle never reaches reservation', async () => {
      jest.spyOn(chronicleRepo, 'findOne').mockResolvedValueOnce({
        id: input.chronicleId,
        userId: input.userId,
        endedAt: new Date(),
      } as ChronicleEntity);
      const reserveSpy = jest.spyOn(reservationService, 'reserve');

      await service.runTurn(input);

      expect(reserveSpy).not.toHaveBeenCalled();
    });

    it('fails with a distinct message if turn reservation fails (idempotency)', async () => {
      jest.spyOn(chronicleRepo, 'findOne').mockResolvedValueOnce(null); // not ended
      jest.spyOn(reservationService, 'reserve').mockResolvedValueOnce(null);

      const result = await service.runTurn(input);

      expect(result.success).toBe(false);
      expect(result.chronicleAlreadyEnded).toBeUndefined();
      expect(result.error).toContain('already processed');
    });
  });

  describe('onModuleInit', () => {
    it('flips stale reserved turns to failed with a ~60s threshold', async () => {
      await service.onModuleInit();

      expect(turnRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'reserved' }),
        { status: 'failed' },
      );
      const [criteria] = (turnRepo.update as jest.Mock).mock.calls[0];
      // LessThan(...) wraps the threshold in a FindOperator — ._value holds the raw Date.
      const staleBefore = criteria.createdAt._value as Date;
      const ageMs = Date.now() - staleBefore.getTime();
      expect(ageMs).toBeGreaterThan(55_000);
      expect(ageMs).toBeLessThan(65_000);
    });
  });
});
