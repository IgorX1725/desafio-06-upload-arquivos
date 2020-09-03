// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    if (type === 'outcome') {
      const { total } = await transactionRepository.getBalance();
      const statement = total - value;
      if (statement < 0) {
        throw new AppError('insufficient balance', 400);
      }
    }
    if (category) {
      const categoryRepository = getRepository(Category);
      const categoryExistent = await categoryRepository.findOne({
        where: { title: category },
      });
      if (categoryExistent) {
        const transaction = transactionRepository.create({
          title,
          value,
          type,
          category_id: categoryExistent.id,
        });
        await transactionRepository.save(transaction);
        return transaction;
      }
      const newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
      const transaction = transactionRepository.create({
        title,
        value,
        type,
        category: newCategory,
      });
      await transactionRepository.save(transaction);
      return transaction;
    }
    const transaction = transactionRepository.create({
      title,
      value,
      type,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
