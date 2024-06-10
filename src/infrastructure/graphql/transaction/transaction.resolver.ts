import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {
  TransactionObject,
  TransactionStatusObject,
  TransactionTypeObject,
  transactionEntityToObject,
} from './transaction.object';
import { CustomUuidScalar } from '../scalar.object';
import { IDataloaders } from '../dataloader.interface';
import {
  TransactionInput,
  transactionInputToEntity,
} from './transaction.input';
import { TransactionService } from 'src/application/transaction/transaction.service';

@Resolver(() => TransactionObject)
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionService) {}

  @Mutation(() => CustomUuidScalar)
  async createTransaction(
    @Args('transaction', { type: () => TransactionInput })
    transaction: TransactionInput,
  ) {
    //parse object to entity
    const entity = transactionInputToEntity(transaction);
    this.transactionService.createTransaction(entity);
    return entity.transactionExternalId;
  }

  @Query(() => TransactionObject, { nullable: true })
  async getTransaction(
    @Args('id', { type: () => CustomUuidScalar }) id: string,
  ) {
    const entity: any = await this.transactionService.getTransaction(id);
    if (entity) {
      //parse object to entity and return it
      return transactionEntityToObject(entity);
    }
    return null;
  }

  /**
   * add and resolve TransactionTypeObject to TransactionObject
   * @param transaction TransactionObject instance
   * @returns TransactionTypeObject
   */
  @ResolveField(() => TransactionTypeObject)
  async transactionType(
    @Parent() transaction: TransactionObject,
    @Context() { loaders }: { loaders: IDataloaders },
  ) {
    //call transaction type dataloader
    return loaders.transactionTypeLoader.load(transaction.transactionTypeId);
  }

  /**
   * add and resolve TransactionStatusObject to TransactionObject
   * @param transaction TransactionObject instance
   * @returns TransactionStatusObject
   */
  @ResolveField(() => TransactionStatusObject)
  async transactionStatus(
    @Parent() transaction: TransactionObject,
    @Context() { loaders }: { loaders: IDataloaders },
  ) {
    //call transaction status dataloader
    return loaders.transactionStatusLoader.load(
      transaction.transactionStatusId,
    );
  }
}
