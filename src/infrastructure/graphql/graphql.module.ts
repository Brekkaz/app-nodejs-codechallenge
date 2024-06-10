import { Module } from '@nestjs/common';
import { DataloaderService } from './dataloader.service';
import { TransactionModule } from './transaction/transaction.module';
import { MongoModule } from '../mongo/mongo.module';

@Module({
  imports: [TransactionModule, MongoModule],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class GraphqlModule {}
