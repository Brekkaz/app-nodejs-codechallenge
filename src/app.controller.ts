import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MicroserviceHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { KafkaOptions, RedisOptions, Transport } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private healthCheckService: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () =>
        this.microservice.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
        }),
      () => this.mongooseHealth.pingCheck('mongoDB'),
      () =>
        this.microservice.pingCheck<KafkaOptions>('kafka', {
          transport: Transport.KAFKA,
        }),
    ]);
  }
}
