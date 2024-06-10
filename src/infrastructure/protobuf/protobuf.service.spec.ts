import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import * as protobufjs from 'protobufjs';
import { ProtobufService } from './protobuf.service';
import { SerializerType } from '../../domain/utils/serializer-type.enum';

jest.mock('protobufjs');
jest.mock('path', () => ({
  join: jest.fn(),
}));

describe('ProtobufService', () => {
  let service: ProtobufService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProtobufService],
    }).compile();

    service = module.get<ProtobufService>(ProtobufService);

    jest.spyOn(Logger, 'log').mockImplementation(() => {});
  });

  describe('onModuleInit', () => {
    it('should load protobuf files on module init', async () => {
      const mockRoot = {};
      (protobufjs.load as jest.Mock).mockResolvedValue(mockRoot);
      (join as jest.Mock).mockReturnValue('/protobuf-files/transaction.proto');

      await service.onModuleInit();

      expect(protobufjs.load).toHaveBeenCalledWith([
        '/protobuf-files/transaction.proto',
      ]);
      expect(service['root']).toBe(mockRoot);
    });

    it('should log an error if protobuf files cannot be loaded', async () => {
      const error = new Error('Load error');
      (protobufjs.load as jest.Mock).mockRejectedValue(error);
      (join as jest.Mock).mockReturnValue('/protobuf-files/transaction.proto');

      await service.onModuleInit();

      expect(Logger.log).toHaveBeenCalledWith(
        {
          Title: 'Error init config of protobuf to message',
          Error: `[${error.name}]: ${error.message}`,
        },
        ProtobufService.name,
      );
    });
  });

  describe('generateProto', () => {
    it('should generate a protobuf buffer from a payload', () => {
      const protoMock = {
        verify: jest.fn().mockReturnValue(null),
        create: jest.fn().mockReturnValue({}),
        encode: jest.fn().mockReturnValue({
          finish: jest.fn().mockReturnValue(Buffer.from('test-buffer')),
        }),
      };
      service['root'] = {
        lookupType: jest.fn().mockReturnValue(protoMock),
      };
      const payload = { id: 1 };

      const result = service.generateProto(SerializerType.Created, payload);

      expect(service['root'].lookupType).toHaveBeenCalledWith(
        SerializerType.Created,
      );
      expect(protoMock.verify).toHaveBeenCalledWith(payload);
      expect(protoMock.create).toHaveBeenCalledWith(payload);
      expect(protoMock.encode().finish).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('test-buffer'));
    });

    it('should log an error if there is a problem generating the protobuf', () => {
      const protoMock = {
        verify: jest.fn().mockReturnValue('error'),
      };
      service['root'] = {
        lookupType: jest.fn().mockReturnValue(protoMock),
      };
      const payload = { id: 1 };

      const result = service.generateProto(SerializerType.Created, payload);

      expect(Logger.log).toHaveBeenCalledWith(
        {
          Title: 'Error generate protobuf from message',
          Error: '[Error]: error',
        },
        ProtobufService.name,
      );
      expect(result).toBeNull();
    });
  });

  describe('decompressProto', () => {
    it('should decompress a protobuf buffer to JSON', () => {
      const buffer = Buffer.from('test-buffer', 'ascii');
      const messageMock = {
        toJSON: jest.fn().mockReturnValue({ id: 1 }),
      };
      const protoMock = {
        decode: jest.fn().mockReturnValue(messageMock),
      };
      service['root'] = {
        lookupType: jest.fn().mockReturnValue(protoMock),
      };

      const result = service.decompressProto(SerializerType.Created, buffer);

      expect(service['root'].lookupType).toHaveBeenCalledWith(
        SerializerType.Created,
      );
      expect(protoMock.decode).toHaveBeenCalledWith(buffer);
      expect(messageMock.toJSON).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });

    it('should log an error if there is a problem decompressing the protobuf', () => {
      const error = new Error('Decode error');
      service['root'] = {
        lookupType: jest.fn().mockImplementation(() => {
          throw error;
        }),
      };
      const buffer = Buffer.from('test-buffer', 'ascii');

      const result = service.decompressProto(SerializerType.Created, buffer);

      expect(Logger.log).toHaveBeenCalledWith(
        {
          Title: 'Error generate protobuf from message',
          Error: `[${error.name}]: ${error.message}`,
        },
        ProtobufService.name,
      );
      expect(result).toBeNull();
    });
  });
});
