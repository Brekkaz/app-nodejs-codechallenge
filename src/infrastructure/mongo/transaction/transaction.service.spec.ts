import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionType } from './transaction-type.schema';
import { TransactionFieldsDBService } from './transaction.service';

describe('TransactionFieldsDBService', () => {
  let service: TransactionFieldsDBService;
  let model: Model<TransactionType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionFieldsDBService,
        {
          provide: getModelToken(TransactionType.name),
          useValue: {
            find: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionFieldsDBService>(
      TransactionFieldsDBService,
    );
    model = module.get<Model<TransactionType>>(
      getModelToken(TransactionType.name),
    );
  });

  describe('onModuleInit', () => {
    it('should call seeders on module init', async () => {
      const spySeeders = jest
        .spyOn(service as any, 'seeders')
        .mockImplementation(async () => {});
      await service.onModuleInit();
      expect(spySeeders).toHaveBeenCalled();
    });
  });

  describe('findTypesByIds', () => {
    it('should find types by ids', async () => {
      const ids = [1, 2];
      const mockTypes = [
        { id: 1, name: 'type 1' },
        { id: 2, name: 'type 2' },
      ];
      (model.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTypes),
      });

      const result = await service.findTypesByIds(ids);

      expect(model.find).toHaveBeenCalledWith({ id: { $in: ids } });
      expect(result).toEqual(mockTypes);
    });
  });

  describe('findStatusByIds', () => {
    it('should find status by ids', () => {
      service['status'] = [
        { id: 'APPROVED', name: 'Approved' },
        { id: 'REJECTED', name: 'Rejected' },
      ];
      const ids = ['APPROVED'];
      const result = service.findStatusByIds(ids);

      expect(result).toEqual([{ id: 'APPROVED', name: 'Approved' }]);
    });
  });

  describe('seeders', () => {
    it('should seed status and default types', async () => {
      const mockStatus = [
        { id: 'f29abdc2-51a4-4130-8e36-bc6193b8de02', name: 'Pending' },
        { id: 'f757da03-6757-41b5-b0f6-ec3555922489', name: 'Approved' },
        { id: '292cb87b-c76f-4657-9326-3bd25679a4cb', name: 'Rejected' },
      ];
      const seedData = [
        { id: 1, name: 'type 1' },
        { id: 2, name: 'type 2' },
      ];
      const findOneAndUpdateMock = jest.fn();
      (model.findOneAndUpdate as jest.Mock).mockImplementation(
        findOneAndUpdateMock,
      );

      await service['seeders']();

      expect(service['status']).toEqual(mockStatus);
      seedData.forEach((data) => {
        expect(findOneAndUpdateMock).toHaveBeenCalledWith(
          { id: data.id },
          data,
          { upsert: true },
        );
      });
    });
  });
});
