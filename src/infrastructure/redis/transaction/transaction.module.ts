import { Module } from '@nestjs/common';
import { TransactionRedisService } from './transaction.service';

@Module({
  providers: [TransactionRedisService],
  exports: [TransactionRedisService],
})
export class TransactionModule {}
