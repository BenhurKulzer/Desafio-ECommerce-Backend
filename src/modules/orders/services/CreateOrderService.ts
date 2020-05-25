import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
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

interface IProductCart {
  product_id: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists.');
    }

    const productsStock = await this.productsRepository.findAllById(products);

    if (productsStock.length === 0) {
      throw new AppError('Products not found.');
    }

    const orderProducts: IProductCart[] = [];
    productsStock.forEach(stock => {
      const productStock = stock;
      const { id: product_id, price, quantity } = productStock;

      const orderProduct = products.find(product => product.id === product_id);

      if (!orderProduct) {
        return;
      }

      if (orderProduct.quantity > quantity) {
        throw new AppError('Products with insufficient quantities.');
      }

      orderProducts.push({
        product_id,
        price,
        quantity: orderProduct.quantity,
      });

      productStock.quantity -= orderProduct.quantity;
    });

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    await this.productsRepository.updateQuantity(productsStock);

    return order;
  }
}

export default CreateProductService;
