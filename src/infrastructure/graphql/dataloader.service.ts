import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { IDataloaders } from './dataloader.interface';
import { TransactionFieldsDBService } from '../mongo/transaction/transaction.service';
import { ITransactionFieldsDBService } from 'src/domain/repositories/transaction-type-db.interface';
import {
  TransactionStatusEntity,
  TransactionTypeEntity,
} from 'src/domain/entities/transaction';

@Injectable()
export class DataloaderService {
  private readonly transactionTypeDBService: ITransactionFieldsDBService;

  constructor(transactionTypeDBService: TransactionFieldsDBService) {
    this.transactionTypeDBService = transactionTypeDBService;
  }

  /**
   * returns object with all dataloaders
   * @returns IDataloaders object
   */
  getLoaders(): IDataloaders {
    const transactionTypeLoader = this.createTransactionTypeLoader();
    const transactionStatusLoader = this.createTransactionStatusLoader();
    return {
      transactionTypeLoader,
      transactionStatusLoader,
    };
  }

  private createTransactionTypeLoader() {
    return new DataLoader<number, TransactionTypeEntity>(
      async (keys: readonly number[]) =>
        await this.transactionTypeDBService.findTypesByIds(keys as number[]),
    );
  }

  private createTransactionStatusLoader() {
    return new DataLoader<string, TransactionStatusEntity>(
      async (keys: readonly string[]) =>
        await this.transactionTypeDBService.findStatusByIds(keys as string[]),
    );
  }
}
