export interface ISerializerService {
  generateProto(protoName: string, payload: any): Buffer;
  decompressProto(protoName: string, buffer: any): any;
}
