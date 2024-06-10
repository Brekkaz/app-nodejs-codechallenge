import {
  TransactionStatusEntity,
  TransactionTypeEntity,
} from '../entities/transaction';

export interface ITransactionFieldsDBService {
  findTypesByIds(ids: number[]): Promise<TransactionTypeEntity[]>;
  findStatusByIds(ids: string[]): TransactionStatusEntity[];
}
