import { Test, TestingModule } from '@nestjs/testing';
import { DataloaderService } from './dataloader.service';
import { TransactionFieldsDBService } from '../mongo/transaction/transaction.service';
import {
  TransactionStatusEntity,
  TransactionTypeEntity,
} from 'src/domain/entities/transaction';

describe('DataloaderService', () => {
  let dataloaderService: DataloaderService;
  let transactionFieldsDBService: TransactionFieldsDBService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataloaderService,
        {
          provide: TransactionFieldsDBService,
          useValue: {
            findTypesByIds: jest.fn(),
            findStatusByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    dataloaderService = module.get<DataloaderService>(DataloaderService);
    transactionFieldsDBService = module.get<TransactionFieldsDBService>(
      TransactionFieldsDBService,
    );
  });

  it('should be defined', () => {
    expect(dataloaderService).toBeDefined();
  });

  it('should return an object with all dataloaders', () => {
    const loaders = dataloaderService.getLoaders();
    expect(loaders).toHaveProperty('transactionTypeLoader');
    expect(loaders).toHaveProperty('transactionStatusLoader');
  });

  it('should load transaction types by ids', async () => {
    const mockTransactionTypes: TransactionTypeEntity[] = [
      { id: 1, name: 'type1' },
      { id: 2, name: 'type2' },
    ];
    (transactionFieldsDBService.findTypesByIds as jest.Mock).mockImplementation(
      (ids: number[]) => {
        return Promise.resolve(
          ids.map(
            (id) =>
              mockTransactionTypes.find((status) => status.id === id) || null,
          ),
        );
      },
    );

    const loaders = dataloaderService.getLoaders();
    const result = await loaders.transactionTypeLoader.load(1);

    expect(transactionFieldsDBService.findTypesByIds).toHaveBeenCalledWith([1]);
    expect(result).toEqual(mockTransactionTypes[0]);
  });

  it('should load transaction statuses by ids', async () => {
    const mockTransactionStatuses: TransactionStatusEntity[] = [
      { id: 'status1', name: 'Status 1' },
      { id: 'status2', name: 'Status 2' },
    ];
    (
      transactionFieldsDBService.findStatusByIds as jest.Mock
    ).mockImplementation((ids: string[]) => {
      return Promise.resolve(
        ids.map(
          (id) =>
            mockTransactionStatuses.find((status) => status.id === id) || null,
        ),
      );
    });

    const loaders = dataloaderService.getLoaders();
    const result = await loaders.transactionStatusLoader.load('status1');

    expect(transactionFieldsDBService.findStatusByIds).toHaveBeenCalledWith([
      'status1',
    ]);
    expect(result).toEqual(mockTransactionStatuses[0]);
  });
});
