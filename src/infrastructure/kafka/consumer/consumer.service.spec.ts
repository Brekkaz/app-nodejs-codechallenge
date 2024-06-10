import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConsumerService } from './consumer.service';
import { Kafka, Consumer } from 'kafkajs';

jest.mock('kafkajs');

describe('ConsumerService', () => {
  let service: ConsumerService;
  let kafkaConsumerMock: Consumer;

  beforeEach(async () => {
    kafkaConsumerMock = {
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    (Kafka as any).mockImplementation(() => ({
      consumer: () => kafkaConsumerMock,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'NODE_ENV':
                  return 'test';
                case 'KAFKA_BROKERS':
                  return 'localhost:9092';
                case 'KAFKA_CLIENT_ID':
                  return 'test_client';
                case 'KAFKA_SCRAM_USERNAME':
                  return 'test_user';
                case 'KAFKA_SCRAM_PASSWORD':
                  return 'test_pass';
                case 'KAFKA_SCRAM_MECHANISM':
                  return 'scram-sha-512';
                case 'APP_NAME':
                  return 'test_app';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ConsumerService>(ConsumerService);
  });

  describe('consume', () => {
    it('should connect, subscribe, and run consumer', async () => {
      const topics: any = ['test-topic'];
      const config = { eachMessage: jest.fn() };

      await service.consume(topics, config);

      expect(kafkaConsumerMock.connect).toHaveBeenCalled();
      expect(kafkaConsumerMock.subscribe).toHaveBeenCalledWith(topics);
      expect(kafkaConsumerMock.run).toHaveBeenCalledWith(config);
    });
  });
});
