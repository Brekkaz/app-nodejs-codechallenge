import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { CustomUuidScalar } from './infrastructure/graphql/scalar.object';
import { GraphqlModule } from './infrastructure/graphql/graphql.module';
import { DataloaderService } from './infrastructure/graphql/dataloader.service';
import { EventsModule } from './infrastructure/kafka/events/events.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        //set infinite time to live
        ttl: 0,
        socket: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [GraphqlModule],
      useFactory: (dataloaderService: DataloaderService) => ({
        buildSchemaOptions: {
          //set default type to 'number' type
          numberScalarMode: 'integer',
        },
        //add uuid scalar
        resolvers: { UUID: CustomUuidScalar },
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        playground: true,
        context: () => ({
          //add dataloaders
          loaders: dataloaderService.getLoaders(),
        }),
      }),
      inject: [DataloaderService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URL'),
        retryWrites: true,
      }),
    }),
    TerminusModule,
    //include and execute queue consumer
    EventsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
