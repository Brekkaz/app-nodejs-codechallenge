import { Injectable, Logger } from '@nestjs/common';
import {
  TransactionEntity,
  TransactionStatusEnum,
} from 'src/domain/entities/transaction';
import { IProducerService } from 'src/domain/repositories/producer.interface';
import { ISerializerService } from 'src/domain/repositories/serializer.interface';
import { ITransactionDBService } from 'src/domain/repositories/transaction-db.interface';
import { ITransactionUseCasesService } from 'src/domain/usecases/transaction-use-cases.interface';
import { SerializerType } from 'src/domain/utils/serializer-type.enum';
import { TransactionTopic } from 'src/domain/utils/topic.enum';
import { ProducerService } from 'src/infrastructure/kafka/producer/producer.service';
import { ProtobufService } from 'src/infrastructure/protobuf/protobuf.service';
import { TransactionRedisService } from 'src/infrastructure/redis/transaction/transaction.service';

@Injectable()
export class TransactionService implements ITransactionUseCasesService {
  private readonly producerService: IProducerService;
  private readonly serializerService: ISerializerService;
  private readonly transactionRedisService: ITransactionDBService;

  /**
   * Assign the dependency injection parameters to the service properties to enforce
   * polymorphism and enable independence from the implemented technologies.
   */
  constructor(
    protobufService: ProtobufService,
    producerKafkaService: ProducerService,
    transactionRedisService: TransactionRedisService,
  ) {
    this.producerService = producerKafkaService;
    this.serializerService = protobufService;
    this.transactionRedisService = transactionRedisService;
  }

  public createTransaction(entity: TransactionEntity): void {
    //save entity in db
    this.transactionRedisService.createTransaction(entity);
    //serialize entity
    const message = this.serializerService.generateProto(
      SerializerType.Created,
      entity,
    );
    //send entity to queue
    this.producerService.produce(TransactionTopic.Created, message);
  }

  public async validateTransaction(
    transactionId: string,
    value: number,
  ): Promise<void> {
    //validate the existence of the entity
    const entity: TransactionEntity =
      await this.transactionRedisService.getTransaction(transactionId);
    if (!entity) {
      Logger.log(
        'Error validating the transaction, entity not found.',
        TransactionService.name,
      );
      return;
    }

    //validate entity value
    if (value > 1000) {
      entity.transactionStatusId = TransactionStatusEnum.Rejected;
    } else {
      entity.transactionStatusId = TransactionStatusEnum.Approved;
    }

    //update entity
    this.transactionRedisService.createTransaction(entity);
  }

  public async getTransaction(id: string): Promise<TransactionEntity> {
    //get transaction from db
    return await this.transactionRedisService.getTransaction(id);
  }
}
