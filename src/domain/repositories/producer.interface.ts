export interface IProducerService {
  produce(topic: string, message: any): Promise<any>;
}
