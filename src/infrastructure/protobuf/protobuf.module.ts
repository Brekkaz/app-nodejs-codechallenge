import { Module } from '@nestjs/common';
import { ProtobufService } from './protobuf.service';

@Module({
  providers: [ProtobufService],
  exports: [ProtobufService],
})
export class ProtobufModule {}
