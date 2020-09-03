import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    const foundTransaction = await transactionRepository.findOne({
      where: { id },
    });
    if (!foundTransaction) {
      throw new AppError('transaction not found', 400);
    }
    await transactionRepository.remove(foundTransaction);
  }
}

export default DeleteTransactionService;
