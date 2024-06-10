import { Test, TestingModule } from '@nestjs/testing';
import { TransactionResolver } from './transaction.resolver';
import { TransactionService } from 'src/application/transaction/transaction.service';
import { IDataloaders } from '../dataloader.interface';
import {
  TransactionObject,
  TransactionStatusObject,
  TransactionTypeObject,
  transactionEntityToObject,
} from './transaction.object';
import {
  TransactionInput,
  transactionInputToEntity,
} from './transaction.input';
import {
  TransactionEntity,
  TransactionStatusEntity,
  TransactionTypeEntity,
} from 'src/domain/entities/transaction';
import DataLoader from 'dataloader';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid');

describe('TransactionResolver', () => {
  let resolver: TransactionResolver;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionResolver,
        {
          provide: TransactionService,
          useValue: {
            createTransaction: jest.fn(),
            getTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<TransactionResolver>(TransactionResolver);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should create a transaction and return the transactionExternalId', async () => {
    const mockTransactionInput: TransactionInput = {
      accountExternalIdDebit: 'string',
      accountExternalIdCredit: 'string',
      tranferTypeId: 1,
      value: 1,
    };
    const mockUuid = '00000000-0000-0000-0000-000000000000';
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);
    const mockTransactionEntity =
      transactionInputToEntity(mockTransactionInput);
    const createTransactionSpy = jest
      .spyOn(transactionService, 'createTransaction')
      .mockImplementation();

    const result = await resolver.createTransaction(mockTransactionInput);

    expect(createTransactionSpy).toHaveBeenCalledWith(mockTransactionEntity);
    expect(result).toBe(mockTransactionEntity.transactionExternalId);
  });

  it('should return a transaction object for a valid id', async () => {
    const mockTransactionEntity: TransactionEntity = {
      transactionExternalId: 'string',
      accountExternalIdDebit: 'string',
      accountExternalIdCredit: 'string',
      tranferTypeId: 1,
      transactionStatusId: 'string',
      value: 1,
      createdAt: new Date(),
    };
    const mockTransactionObject = transactionEntityToObject(
      mockTransactionEntity,
    );
    jest
      .spyOn(transactionService, 'getTransaction')
      .mockResolvedValue(mockTransactionEntity);

    const result = await resolver.getTransaction(
      mockTransactionEntity.transactionExternalId,
    );

    expect(result).toEqual(mockTransactionObject);
  });

  it('should return null for an invalid id', async () => {
    const mockId = 'mock-id';
    jest.spyOn(transactionService, 'getTransaction').mockResolvedValue(null);

    const result = await resolver.getTransaction(mockId);

    expect(result).toBeNull();
  });

  it('should resolve transaction type using the dataloader', async () => {
    const mockTransaction: TransactionObject = {
      transactionExternalId: 'string',
      transactionTypeId: 1,
      transactionStatusId: 'string',
      value: 1,
      createdAt: new Date(),
    };
    const mockTransactionTypeObject: TransactionTypeObject = {
      id: 1,
      name: 'string',
    };
    const transactionTypeLoader: DataLoader<number, TransactionTypeEntity> = {
      load: jest.fn().mockResolvedValue(mockTransactionTypeObject),
      loadMany: jest.fn(),
      clear: jest.fn(),
      clearAll: jest.fn(),
      prime: jest.fn(),
      name: '',
    };
    const transactionStatusLoader: DataLoader<string, TransactionStatusEntity> =
      {
        load: jest.fn(),
        loadMany: jest.fn(),
        clear: jest.fn(),
        clearAll: jest.fn(),
        prime: jest.fn(),
        name: '',
      };
    const mockLoaders: IDataloaders = {
      transactionTypeLoader,
      transactionStatusLoader,
    };

    const result = await resolver.transactionType(mockTransaction, {
      loaders: mockLoaders,
    });

    expect(mockLoaders.transactionTypeLoader.load).toHaveBeenCalledWith(
      mockTransaction.transactionTypeId,
    );
    expect(result).toEqual(mockTransactionTypeObject);
  });

  it('should resolve transaction status using the dataloader', async () => {
    const mockTransaction: TransactionObject = {
      transactionExternalId: 'string',
      transactionTypeId: 1,
      transactionStatusId: 'string',
      value: 1,
      createdAt: new Date(),
    };
    const mockTransactionStatusObject: TransactionStatusObject = {
      id: 'string',
      name: 'string',
    };
    const transactionTypeLoader: DataLoader<number, TransactionTypeEntity> = {
      load: jest.fn(),
      loadMany: jest.fn(),
      clear: jest.fn(),
      clearAll: jest.fn(),
      prime: jest.fn(),
      name: '',
    };
    const transactionStatusLoader: DataLoader<string, TransactionStatusEntity> =
      {
        load: jest.fn().mockResolvedValue(mockTransactionStatusObject),
        loadMany: jest.fn(),
        clear: jest.fn(),
        clearAll: jest.fn(),
        prime: jest.fn(),
        name: '',
      };
    const mockLoaders: IDataloaders = {
      transactionTypeLoader,
      transactionStatusLoader,
    };

    const result = await resolver.transactionStatus(mockTransaction, {
      loaders: mockLoaders,
    });

    expect(mockLoaders.transactionStatusLoader.load).toHaveBeenCalledWith(
      mockTransaction.transactionStatusId,
    );
    expect(result).toEqual(mockTransactionStatusObject);
  });
});
