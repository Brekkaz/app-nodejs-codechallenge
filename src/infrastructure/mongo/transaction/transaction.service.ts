import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionType } from './transaction-type.schema';
import { ITransactionFieldsDBService } from 'src/domain/repositories/transaction-type-db.interface';
import {
  TransactionStatusEntity,
  TransactionStatusEnum,
  TransactionTypeEntity,
} from 'src/domain/entities/transaction';

@Injectable()
export class TransactionFieldsDBService
  implements ITransactionFieldsDBService, OnModuleInit
{
  private status: TransactionStatusEntity[];
  constructor(
    @InjectModel(TransactionType.name)
    private transactionTypeModel: Model<TransactionType>,
  ) {}

  onModuleInit() {
    this.seeders();
  }

  /**
   * types query to dataloader
   * @param ids types ids
   * @returns TransactionTypeEntity[]
   */
  async findTypesByIds(ids: number[]): Promise<TransactionTypeEntity[]> {
    return await this.transactionTypeModel.find({ id: { $in: ids } }).exec();
  }

  /**
   * status query to dataloaders
   * @param ids types ids
   * @returns TransactionStatusEntity[]
   */
  findStatusByIds(ids: string[]): TransactionStatusEntity[] {
    return this.status.filter((status) => ids.includes(status.id));
  }

  private async seeders(): Promise<void> {
    //generate status collection from enum
    this.status = Object.keys(TransactionStatusEnum).map((key) => ({
      id: TransactionStatusEnum[key],
      name: key,
    }));

    //insert default types in db
    const seedData = [
      { id: 1, name: 'type 1' },
      { id: 2, name: 'type 2' },
    ];

    const promises = seedData.map((data) =>
      this.transactionTypeModel.findOneAndUpdate({ id: data.id }, data, {
        upsert: true,
      }),
    );

    await Promise.all(promises);
  }
}
