import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { ProducerService } from 'src/infrastructure/kafka/producer/producer.service';
import { ProtobufService } from 'src/infrastructure/protobuf/protobuf.service';
import { TransactionRedisService } from 'src/infrastructure/redis/transaction/transaction.service';
import {
  TransactionEntity,
  TransactionStatusEnum,
} from 'src/domain/entities/transaction';
import { SerializerType } from 'src/domain/utils/serializer-type.enum';
import { TransactionTopic } from 'src/domain/utils/topic.enum';
import { Logger } from '@nestjs/common';

describe('TransactionService', () => {
  let service: TransactionService;
  let producerService: ProducerService;
  let serializerService: ProtobufService;
  let transactionDBService: TransactionRedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: ProducerService, useValue: { produce: jest.fn() } },
        { provide: ProtobufService, useValue: { generateProto: jest.fn() } },
        {
          provide: TransactionRedisService,
          useValue: { createTransaction: jest.fn(), getTransaction: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    producerService = module.get<ProducerService>(ProducerService);
    serializerService = module.get<ProtobufService>(ProtobufService);
    transactionDBService = module.get<TransactionRedisService>(
      TransactionRedisService,
    );
  });

  describe('createTransaction', () => {
    it('should save, serialize, and send the transaction', () => {
      const entity: TransactionEntity = {
        transactionExternalId: 'string',
        accountExternalIdDebit: 'string',
        accountExternalIdCredit: 'string',
        tranferTypeId: 1,
        transactionStatusId: 'string',
        value: 1,
        createdAt: new Date(),
      };

      service.createTransaction(entity);

      expect(transactionDBService.createTransaction).toHaveBeenCalledWith(
        entity,
      );
      expect(serializerService.generateProto).toHaveBeenCalledWith(
        SerializerType.Created,
        entity,
      );
      expect(producerService.produce).toHaveBeenCalledWith(
        TransactionTopic.Created,
        undefined,
      );
    });
  });

  describe('validateTransaction', () => {
    it('should approve a valid transaction', async () => {
      const entity: TransactionEntity = {
        transactionExternalId: 'string',
        accountExternalIdDebit: 'string',
        accountExternalIdCredit: 'string',
        tranferTypeId: 1,
        transactionStatusId: 'string',
        value: 1,
        createdAt: new Date(),
      };
      jest
        .spyOn(transactionDBService, 'getTransaction')
        .mockResolvedValue(entity);

      await service.validateTransaction('1', 500);

      expect(entity.transactionStatusId).toBe(TransactionStatusEnum.Approved);
      expect(transactionDBService.createTransaction).toHaveBeenCalledWith(
        entity,
      );
    });

    it('should reject an invalid transaction', async () => {
      const entity: TransactionEntity = {
        transactionExternalId: 'string',
        accountExternalIdDebit: 'string',
        accountExternalIdCredit: 'string',
        tranferTypeId: 1,
        transactionStatusId: 'string',
        value: 1,
        createdAt: new Date(),
      };
      jest
        .spyOn(transactionDBService, 'getTransaction')
        .mockResolvedValue(entity);

      await service.validateTransaction('1', 1500);

      expect(entity.transactionStatusId).toBe(TransactionStatusEnum.Rejected);
      expect(transactionDBService.createTransaction).toHaveBeenCalledWith(
        entity,
      );
    });

    it('should log an error if the transaction is not found', async () => {
      jest
        .spyOn(transactionDBService, 'getTransaction')
        .mockResolvedValue(null);
      const loggerSpy = jest.spyOn(Logger, 'log');

      await service.validateTransaction('1', 500);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error validating the transaction, entity not found.',
        'TransactionService',
      );
    });
  });

  describe('getTransaction', () => {
    it('should return the transaction entity', async () => {
      const entity: TransactionEntity = {
        transactionExternalId: 'string',
        accountExternalIdDebit: 'string',
        accountExternalIdCredit: 'string',
        tranferTypeId: 1,
        transactionStatusId: 'string',
        value: 1,
        createdAt: new Date(),
      };
      jest
        .spyOn(transactionDBService, 'getTransaction')
        .mockResolvedValue(entity);

      const result = await service.getTransaction('1');

      expect(result).toBe(entity);
    });
  });
});
