/* eslint no-param-reassign: "error" */
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
    const allTransactions = await this.find();

    const { income, outcome } = allTransactions.reduce(
      (acumulator, currentTransaction) => {
        switch (currentTransaction.type) {
          case 'income':
            acumulator.income += currentTransaction.value;
            break;
          case 'outcome':
            acumulator.outcome += currentTransaction.value;
            break;
          default:
            break;
        }
        return acumulator;
      },
      { income: 0, outcome: 0, total: 0 },
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
