import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ProtobufModule } from 'src/infrastructure/protobuf/protobuf.module';
import { ProducerModule } from 'src/infrastructure/kafka/producer/producer.module';
import { TransactionModule as TransactionDBModule } from 'src/infrastructure/redis/transaction/transaction.module';

@Module({
  imports: [ProtobufModule, ProducerModule, TransactionDBModule],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
