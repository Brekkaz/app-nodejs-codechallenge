import { Module } from '@nestjs/common';
import { TransactionResolver } from './transaction.resolver';
import { TransactionModule as UseCaseModule } from 'src/application/transaction/transaction.module';

@Module({
  imports: [UseCaseModule],
  providers: [TransactionResolver],
})
export class TransactionModule {}
