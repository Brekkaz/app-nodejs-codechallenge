import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { ConsumerService } from '../consumer/consumer.service';
import { ProtobufService } from 'src/infrastructure/protobuf/protobuf.service';
import { TransactionService } from 'src/application/transaction/transaction.service';
import { TransactionTopic } from '../../../domain/utils/topic.enum';

describe('EventsService', () => {
  let service: EventsService;
  let consumerService: ConsumerService;
  let protobufService: ProtobufService;

  beforeEach(async () => {
    const consumerServiceMock = {
      consume: jest.fn(),
    };

    const protobufServiceMock = {
      decompressProto: jest.fn(),
    };

    const transactionServiceMock = {
      validateTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: ConsumerService, useValue: consumerServiceMock },
        { provide: ProtobufService, useValue: protobufServiceMock },
        { provide: TransactionService, useValue: transactionServiceMock },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    consumerService = module.get<ConsumerService>(ConsumerService);
    protobufService = module.get<ProtobufService>(ProtobufService);
  });

  it('should consume messages and validate transactions', async () => {
    (protobufService.decompressProto as jest.Mock).mockReturnValueOnce({
      transactionExternalId: 'mocked-id',
      value: 100,
    });

    await service.getMessagePayloads();

    expect(consumerService.consume).toHaveBeenCalledWith(
      { topics: [TransactionTopic.Created] },
      expect.objectContaining({
        eachMessage: expect.any(Function),
      }),
    );
  });
});
