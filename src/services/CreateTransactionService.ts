import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
// import transactionsRouter from '../routes/transactions.routes';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    const customTransactionRepository = getCustomRepository(
      TransactionsRepository,
    );

    const balance = customTransactionRepository.getBalance();

    if (type === 'outcome' && (await balance).total < value) {
      throw new AppError(
        'Your balance is not enought to complete this operation',
      );
    }

    const checkTransactionTitleExists = await transactionsRepository.findOne({
      where: { title },
    });

    if (checkTransactionTitleExists) {
      throw new AppError('This transaction title already exists');
    }

    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: transactionCategory?.id,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
