import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { TransactionEntity } from 'src/domain/entities/transaction';
import { ITransactionDBService } from 'src/domain/repositories/transaction-db.interface';

/**
 * Wrapper to add types to cache service
 */
@Injectable()
export class TransactionRedisService implements ITransactionDBService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public createTransaction(entity: TransactionEntity): void {
    this.cacheManager.set(entity.transactionExternalId, entity);
  }

  public async getTransaction(id: string): Promise<TransactionEntity | null> {
    return await this.cacheManager.get(id);
  }
}
