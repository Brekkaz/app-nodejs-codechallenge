import { Field, Float, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { CustomUuidScalar } from '../scalar.object';
import { TransactionEntity } from 'src/domain/entities/transaction';

@ObjectType()
export class TransactionObject {
  @Field(() => CustomUuidScalar)
  transactionExternalId: string;

  @Field(() => Number)
  transactionTypeId: number;

  @Field(() => CustomUuidScalar)
  transactionStatusId: string;

  @Field(() => Float)
  value: number;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}

@ObjectType()
export class TransactionTypeObject {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class TransactionStatusObject {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}

/**
 * parse TransactionEntity to TransactionObject
 * @param entity TransactionEntity
 * @returns TransactionObject
 */
export function transactionEntityToObject(
  entity: TransactionEntity,
): TransactionObject {
  return {
    ...entity,
    transactionTypeId: entity.tranferTypeId,
    createdAt: new Date(entity.createdAt), //parse string to datetime
  };
}
