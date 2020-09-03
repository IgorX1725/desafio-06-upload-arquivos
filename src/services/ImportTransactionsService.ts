import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  csvFilePath: string;
}
interface TransactionObject {
  title: string;
  value: number;
  type: 'outcome' | 'income';
  category?: string | undefined;
}
class ImportTransactionsService {
  async execute({ csvFilePath }: Request): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactionsData: TransactionObject[] = [];
    const categoriesData: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((element: string) => {
        return element.trim();
      });
      if (!title || !type || !value) return;
      const transactionData = {
        title,
        type,
        value,
        category,
      };
      categoriesData.push(category);
      transactionsData.push(transactionData);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));
    console.log();

    const existentCategories = await categoryRepository.find({
      where: {
        title: In(categoriesData),
      },
    });
    const existentCategoriesTitles = existentCategories.map(category => {
      return category.title;
    });
    const categoriesTOAddOnDB = categoriesData
      .filter(category => {
        return !existentCategoriesTitles.includes(category);
      })
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      categoriesTOAddOnDB.map(title => {
        return { title };
      }),
    );
    await categoryRepository.save(newCategories);

    const allCategories = [...existentCategories, ...newCategories];

    const transactionsToCreate = transactionsData.map(transaction => ({
      title: transaction.title,
      type: transaction.type,
      value: transaction.value,
      category: allCategories.find(
        category => category.title === transaction.category,
      ),
    }));
    // console.log(transactionsToCreate);

    const newTransactions = transactionRepository.create(transactionsToCreate);
    await transactionRepository.save(newTransactions);
    return newTransactions;
  }
}

export default ImportTransactionsService;
