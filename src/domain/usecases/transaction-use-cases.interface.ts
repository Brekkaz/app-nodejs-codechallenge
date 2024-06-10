import { TransactionEntity } from '../entities/transaction';

export interface ITransactionUseCasesService {
  createTransaction(entity: TransactionEntity): void;
  validateTransaction(transactionId: string, value: number): Promise<void>;
  getTransaction(id: string): Promise<TransactionEntity>;
}
