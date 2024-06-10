import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProducerService } from './producer.service';
import * as Kafka from 'kafkajs';

jest.mock('kafkajs');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('ProducerService', () => {
  let service: ProducerService;
  let configService: ConfigService;
  let kafkaProducerMock: Kafka.Producer;

  beforeEach(async () => {
    kafkaProducerMock = {
      connect: jest.fn(),
      send: jest.fn().mockResolvedValue([{ topicName: 'test-topic' }]),
    } as any;

    (Kafka as any).Kafka = jest.fn().mockReturnValue({
      producer: () => kafkaProducerMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducerService,
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
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ProducerService>(ProducerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('constructor', () => {
    it('should initialize Kafka producer correctly', () => {
      expect(Kafka.Kafka).toHaveBeenCalledWith({
        brokers: ['localhost:9092'],
        clientId: 'test_client',
        ssl: true,
        sasl: {
          mechanism: 'scram-sha-512',
          username: 'test_user',
          password: 'test_pass',
        },
      });
      expect(service['producerKafka']).toBe(kafkaProducerMock);
    });

    it('should initialize Kafka producer without credentials in local environment', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'local';
        if (key === 'KAFKA_BROKERS') return 'localhost:9092';
        if (key === 'KAFKA_CLIENT_ID') return 'test_client';
        return null;
      });

      const localService = new ProducerService(configService);

      expect(Kafka.Kafka).toHaveBeenCalledWith({
        brokers: ['localhost:9092'],
        clientId: 'test_client',
      });
      expect(localService['producerKafka']).toBe(kafkaProducerMock);
    });
  });

  describe('produce', () => {
    it('should produce a message to Kafka', async () => {
      const topic = 'test-topic';
      const message = 'test-message';

      const result = await service.produce(topic, message);

      expect(kafkaProducerMock.connect).toHaveBeenCalled();
      expect(kafkaProducerMock.send).toHaveBeenCalledWith({
        topic: topic,
        compression: Kafka.CompressionTypes.GZIP,
        messages: [
          {
            headers: {
              eventName: topic,
              source: 'test_client',
            },
            key: 'mock-uuid',
            value: message,
            timestamp: expect.any(String),
          },
        ],
      });
      expect(result).toEqual([{ topicName: 'test-topic' }]);
    });

    it('should log an error if message sending fails', async () => {
      const error = new Error('test error');
      (kafkaProducerMock.send as jest.Mock).mockRejectedValueOnce(error);
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
      const topic = 'test-topic';
      const message = 'test-message';

      const result = await service.produce(topic, message);

      expect(loggerErrorSpy).toHaveBeenCalledWith({
        Title: 'not sended message to brokers',
        Error: `[Error]: test error`,
      });
      expect(result).toBeNull();
    });
  });
});
