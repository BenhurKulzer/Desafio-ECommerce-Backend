import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomerRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const findEmail = await this.customersRepository.findByEmail(email);

    if (findEmail) {
      throw new AppError('This customer is already created');
    }

    const costumer = await this.customersRepository.create({
      name,
      email,
    });

    return costumer;
  }
}

export default CreateCustomerService;
