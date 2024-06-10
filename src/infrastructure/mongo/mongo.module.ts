import { Module } from '@nestjs/common';
import { TransactionFieldsDBService } from './transaction/transaction.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TransactionType,
  TransactionTypeSchema,
} from './transaction/transaction-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransactionType.name, schema: TransactionTypeSchema },
    ]),
  ],
  providers: [TransactionFieldsDBService],
  exports: [TransactionFieldsDBService],
})
export class MongoModule {}
