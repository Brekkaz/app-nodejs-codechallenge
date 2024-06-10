import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Kafka from 'kafkajs';
import { IProducerService } from 'src/domain/repositories/producer.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProducerService implements IProducerService {
  private readonly logger = new Logger(ProducerService.name);
  private kafkaInstance: Kafka.Kafka | undefined;
  private producerKafka: Kafka.Producer | undefined;

  constructor(private configService: ConfigService) {
    Logger.log(
      `Kafka producer to connection with ms stack ${this.configService.get('NODE_ENV')}`,
      ProducerService.name,
    );

    const brokers = this.configService.get('KAFKA_BROKERS')
      ? this.configService.get('KAFKA_BROKERS').split(',')
      : [];
    const clientId = this.configService.get('KAFKA_CLIENT_ID')
      ? this.configService.get('KAFKA_CLIENT_ID')
      : 'test_client';
    const username = this.configService.get('KAFKA_SCRAM_USERNAME')
      ? this.configService.get('KAFKA_SCRAM_USERNAME')
      : '';
    const password = this.configService.get('KAFKA_SCRAM_PASSWORD')
      ? this.configService.get('KAFKA_SCRAM_PASSWORD')
      : '';

    //set local environment without credentials
    if (this.configService.get('NODE_ENV') == 'local') {
      this.kafkaInstance = new Kafka.Kafka({
        brokers: brokers,
        clientId: clientId,
      });
    } else {
      this.kafkaInstance = new Kafka.Kafka({
        brokers: brokers,
        clientId: clientId,
        ssl: true,
        sasl: {
          mechanism: 'scram-sha-512',
          username: username,
          password: password,
        },
      });
    }

    this.producerKafka = this.kafkaInstance.producer();
  }

  async produce(topic: string, message: any) {
    try {
      await this.producerKafka.connect();
      const payload = [
        {
          headers: {
            eventName: topic,
            source: this.configService.get('KAFKA_CLIENT_ID'),
          },
          key: uuidv4(),
          value: message,
          timestamp: `${Date.now()}`,
        },
      ];

      return await this.producerKafka.send({
        topic: topic,
        compression: Kafka.CompressionTypes.GZIP,
        messages: payload,
      });
    } catch (error) {
      this.logger.error({
        Title: 'not sended message to brokers',
        Error: `[${error.name}]: ${error.message}`,
      });
      return null;
    }
  }
}
