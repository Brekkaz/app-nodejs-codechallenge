/**
 * DTO entities
 */

export class TransactionEntity {
  transactionExternalId: string;
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  tranferTypeId: number;
  transactionStatusId: string;
  value: number;
  createdAt: Date;
}

export class TransactionTypeEntity {
  id: number;
  name: string;
}

export class TransactionStatusEntity {
  id: string;
  name: string;
}

export enum TransactionStatusEnum {
  Pending = 'f29abdc2-51a4-4130-8e36-bc6193b8de02',
  Approved = 'f757da03-6757-41b5-b0f6-ec3555922489',
  Rejected = '292cb87b-c76f-4657-9326-3bd25679a4cb',
}
