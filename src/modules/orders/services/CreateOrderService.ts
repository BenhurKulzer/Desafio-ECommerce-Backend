import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exist!');
    }

    const prodDb = await this.productsRepository.findAllById(
      products.map(prod => {
        return { id: prod.id };
      }),
    );

    if (prodDb.length === 0) {
      throw new AppError('No product with the provided ids were found');
    }

    const productsParsed = products.map(prod => {
      const productFound = prodDb.find(pr => pr.id === prod.id);

      if (productFound && productFound.quantity < prod.quantity) {
        throw new AppError(
          'The quantity on the order is bigger than the available for the product!',
        );
      }

      const price = productFound ? productFound.price : 0;
      return {
        product_id: prod.id,
        price,
        quantity: prod.quantity,
      };
    });

    // subtract amount of the product
    await this.productsRepository.updateQuantity(
      products.map(prod => {
        return {
          id: prod.id,
          quantity: prod.quantity,
        };
      }),
    );

    // create the order
    const orderCreated = await this.ordersRepository.create({
      customer,
      products: productsParsed,
    });

    return orderCreated;
  }
}

export default CreateOrderService;
