import { TransactionEntity } from '../entities/transaction';

export interface ITransactionDBService {
  createTransaction(entity: TransactionEntity): void;
  getTransaction(id: string): Promise<TransactionEntity | null>;
}
