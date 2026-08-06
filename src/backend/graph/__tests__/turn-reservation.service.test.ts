import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { TurnReservationService } from '../turn-reservation.service';
import { TurnEntity } from '../../entities/turn.entity';

describe('TurnReservationService', () => {
  let service: TurnReservationService;
  let dataSource: DataSource;
  let turnRepo: Repository<TurnEntity>;

  // In-memory SQLite for testing (requires better setup in real project)
  // For now, mock the dataSource.query calls

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TurnReservationService,
        {
          provide: DataSource,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TurnReservationService>(TurnReservationService);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('reserve', () => {
    it('should return new turn if INSERT succeeds', async () => {
      const turnId = 'turn-123';
      const userId = 'user-456';
      const chronicleId = 'chronicle-789';

      const mockTurn = {
        turn_id: turnId,
        user_id: userId,
        chronicle_id: chronicleId,
        status: 'reserved',
      };

      jest.spyOn(dataSource, 'query').mockResolvedValueOnce([mockTurn]);

      const result = await service.reserve(turnId, userId, chronicleId);

      expect(result).toEqual(mockTurn);
      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO turns'),
        [turnId, userId, chronicleId]
      );
    });

    it('should retry UPDATE if INSERT conflicts', async () => {
      const turnId = 'turn-123';
      const userId = 'user-456';
      const chronicleId = 'chronicle-789';

      const mockTurn = {
        turn_id: turnId,
        user_id: userId,
        status: 'reserved',
      };

      // First call (INSERT): returns empty (conflict)
      // Second call (UPDATE): returns the retry turn
      jest
        .spyOn(dataSource, 'query')
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([mockTurn]);

      const result = await service.reserve(turnId, userId, chronicleId);

      expect(result).toEqual(mockTurn);
      expect(dataSource.query).toHaveBeenCalledTimes(2);
      // First call: INSERT
      expect(dataSource.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('INSERT INTO turns'),
        [turnId, userId, chronicleId]
      );
      // Second call: UPDATE where status='failed'
      expect(dataSource.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('UPDATE turns'),
        [turnId, userId]
      );
    });

    it('should return null if turn already reserved/completed', async () => {
      const turnId = 'turn-123';
      const userId = 'user-456';
      const chronicleId = 'chronicle-789';

      // INSERT fails (conflict), UPDATE fails (not in failed state)
      jest
        .spyOn(dataSource, 'query')
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.reserve(turnId, userId, chronicleId);

      expect(result).toBeNull();
    });

    it('should handle DB errors gracefully', async () => {
      const turnId = 'turn-123';
      const userId = 'user-456';
      const chronicleId = 'chronicle-789';

      jest
        .spyOn(dataSource, 'query')
        .mockRejectedValueOnce(new Error('DB connection failed'));

      await expect(
        service.reserve(turnId, userId, chronicleId)
      ).rejects.toThrow('DB connection failed');
    });
  });
});
