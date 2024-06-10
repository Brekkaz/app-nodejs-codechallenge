import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Min, Max } from 'class-validator';
import { CustomUuidScalar } from '../scalar.object';
import {
  TransactionEntity,
  TransactionStatusEnum,
} from 'src/domain/entities/transaction';
import { v4 as uuidv4 } from 'uuid';

@InputType()
export class TransactionInput {
  @Field(() => CustomUuidScalar)
  accountExternalIdDebit: string;

  @Field(() => CustomUuidScalar)
  accountExternalIdCredit: string;

  @Field(() => Int)
  @Min(1)
  @Max(2)
  tranferTypeId: number;

  @Field(() => Float)
  @Min(1)
  //@Max(1000) anti-fraud validation😁
  value: number;
}

/**
 * parse TransactionInput to TransactionEntity; set a random uuid, pending status and current datetime.
 * @param input TransactionInput
 * @returns TransactionEntity
 */
export function transactionInputToEntity(
  input: TransactionInput,
): TransactionEntity {
  return {
    ...input,
    transactionExternalId: uuidv4(),
    transactionStatusId: TransactionStatusEnum.Pending,
    createdAt: new Date(),
  };
}
