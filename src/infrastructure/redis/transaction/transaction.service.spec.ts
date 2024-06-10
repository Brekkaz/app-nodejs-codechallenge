import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TransactionEntity } from 'src/domain/entities/transaction';
import { TransactionRedisService } from './transaction.service';

describe('TransactionRedisService', () => {
  let service: TransactionRedisService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRedisService,
        {
          provide: CACHE_MANAGER,
          useValue: { set: jest.fn(), get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TransactionRedisService>(TransactionRedisService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  describe('createTransaction', () => {
    it('should save the transaction in the cache', () => {
      const entity: TransactionEntity = {
        transactionExternalId: '123',
        accountExternalIdDebit: 'debit123',
        accountExternalIdCredit: 'credit123',
        tranferTypeId: 1,
        transactionStatusId: 'Pending',
        value: 100,
        createdAt: new Date(),
      };

      service.createTransaction(entity);

      expect(cacheManager.set).toHaveBeenCalledWith(
        entity.transactionExternalId,
        entity,
      );
    });
  });

  describe('getTransaction', () => {
    it('should retrieve the transaction from the cache', async () => {
      const entity: TransactionEntity = {
        transactionExternalId: '123',
        accountExternalIdDebit: 'debit123',
        accountExternalIdCredit: 'credit123',
        tranferTypeId: 1,
        transactionStatusId: 'Pending',
        value: 100,
        createdAt: new Date(),
      };
      jest.spyOn(cacheManager, 'get').mockResolvedValue(entity);

      const result = await service.getTransaction('123');

      expect(result).toBe(entity);
      expect(cacheManager.get).toHaveBeenCalledWith('123');
    });

    it('should return null if the transaction is not in the cache', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      const result = await service.getTransaction('nonexistent-id');

      expect(result).toBeNull();
      expect(cacheManager.get).toHaveBeenCalledWith('nonexistent-id');
    });
  });
});
