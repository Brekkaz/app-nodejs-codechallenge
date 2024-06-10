import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { join } from 'path';
import * as protobufjs from 'protobufjs';
import { SerializerType } from '../../domain/utils/serializer-type.enum';
import { ISerializerService } from 'src/domain/repositories/serializer.interface';

@Injectable()
export class ProtobufService implements OnModuleInit, ISerializerService {
  private root;

  constructor() {
    this.onModuleInit = this.onModuleInit.bind(this);
  }

  /**
   * Generate js files from protobuf files
   */
  async onModuleInit() {
    try {
      this.root = await protobufjs.load([
        join(__dirname, '/protobuf-files/transaction.proto'),
      ]);
    } catch (error) {
      Logger.log(
        {
          Title: 'Error init config of protobuf to message',
          Error: `[${error.name}]: ${error.message}`,
        },
        ProtobufService.name,
      );
    }
  }

  generateProto(protoName: SerializerType, payload: any): Buffer {
    try {
      const proto = this.root.lookupType(protoName);

      const errorVerify = proto.verify(payload);
      if (errorVerify) throw Error(errorVerify);

      const message = proto.create(payload);
      const bufferTemp = proto.encode(message).finish();

      return bufferTemp;
    } catch (error) {
      Logger.log(
        {
          Title: 'Error generate protobuf from message',
          Error: `[${error.name}]: ${error.message}`,
        },
        ProtobufService.name,
      );
      return null;
    }
  }

  decompressProto(protoName: SerializerType, buffer): any {
    try {
      const messageBufferAscii = Buffer.from(buffer, 'ascii');
      const proto = this.root.lookupType(protoName);

      const debuf = proto.decode(messageBufferAscii);
      return debuf.toJSON();
    } catch (error) {
      Logger.log(
        {
          Title: 'Error generate protobuf from message',
          Error: `[${error.name}]: ${error.message}`,
        },
        ProtobufService.name,
      );
      return null;
    }
  }
}
