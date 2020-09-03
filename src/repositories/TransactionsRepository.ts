import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income = await this.createQueryBuilder('transactions')
      .select('SUM(transactions.value)', 'sum')
      .where(`transactions.type = 'income'`)
      .getRawOne()
      .then(result => (result.sum == null ? 0 : parseInt(result.sum, 10)));
    const outcome = await this.createQueryBuilder('transactions')
      .select('SUM(transactions.value)', 'sum')
      .where(`transactions.type = 'outcome'`)
      .getRawOne()
      .then(result => (result.sum == null ? 0 : parseInt(result.sum, 10)));

    const total = income - outcome;
    return { income, outcome, total };
  }
}

export default TransactionsRepository;
