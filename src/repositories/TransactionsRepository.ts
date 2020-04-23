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
    const transactions = await this.find();

    const income = transactions.reduce((acomulator, transaction) => {
      return transaction.type === 'income'
        ? acomulator + transaction.value
        : acomulator;
    }, 0);

    const outcome = transactions.reduce((acomulator, transaction) => {
      return transaction.type === 'outcome'
        ? acomulator + transaction.value
        : acomulator;
    }, 0);

    const total = income - outcome;

    const balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
