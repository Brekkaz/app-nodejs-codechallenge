import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { ConsumerModule } from '../consumer/consumer.module';
import { ProtobufModule } from 'src/infrastructure/protobuf/protobuf.module';
import { TransactionModule } from 'src/application/transaction/transaction.module';

@Module({
  imports: [ConsumerModule, ProtobufModule, TransactionModule],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
