import DataLoader from 'dataloader';
import {
  TransactionStatusEntity,
  TransactionTypeEntity,
} from 'src/domain/entities/transaction';

export interface IDataloaders {
  transactionTypeLoader: DataLoader<number, TransactionTypeEntity>;
  transactionStatusLoader: DataLoader<string, TransactionStatusEntity>;
}
