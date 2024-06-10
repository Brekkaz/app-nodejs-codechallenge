import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafka: Kafka;
  private consumer: Consumer;

  constructor(private configService: ConfigService) {
    const brokers = this.configService.get('KAFKA_BROKERS')
      ? this.configService.get('KAFKA_BROKERS').split(',')
      : [];
    const clientId = this.configService.get('KAFKA_CLIENT_ID') || 'test_client';
    const username = this.configService.get('KAFKA_SCRAM_USERNAME') || '';
    const password = this.configService.get('KAFKA_SCRAM_PASSWORD') || '';
    const scramMechanism =
      this.configService.get('KAFKA_SCRAM_MECHANISM') || '';

    const config: any = {
      brokers: brokers,
      clientId: clientId,
    };

    //add Kafka credentials to environments other than the local one
    if (this.configService.get('NODE_ENV') != 'local') {
      config.ssl = true;
      config.sasl = {
        mechanism: scramMechanism,
        username: username,
        password: password,
      };
    }

    this.kafka = new Kafka(config);
  }

  async consume(topics: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    //connect consumer
    const groupIdString = `${this.configService.get('APP_NAME')}`;

    this.consumer = this.kafka.consumer({
      groupId: groupIdString,
    });
    await this.consumer.connect();

    //subscribe topic
    await this.consumer.subscribe(topics);
    await this.consumer.run(config);
  }

  async onApplicationShutdown() {
    await this.consumer.disconnect();
  }
}
