import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from '../consumer/consumer.service';
import { TransactionTopic } from '../../../domain/utils/topic.enum';
import { ProtobufService } from 'src/infrastructure/protobuf/protobuf.service';
import { TransactionService } from 'src/application/transaction/transaction.service';
import { SerializerType } from 'src/domain/utils/serializer-type.enum';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private readonly protobufService: ProtobufService,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * config and initialize the kafka consumer
   */
  async getMessagePayloads() {
    await this.consumerService.consume(
      {
        topics: [TransactionTopic.Created],
      },
      {
        eachMessage: async (event) => {
          switch (event.topic) {
            case TransactionTopic.Created:
              const payload = this.protobufService.decompressProto(
                SerializerType.Created,
                event.message.value,
              );
              await this.transactionService.validateTransaction(
                payload.transactionExternalId,
                payload.value,
              );
              break;
            default:
              break;
          }
        },
      },
    );
  }

  async onModuleInit() {
    await this.getMessagePayloads();
  }
}
