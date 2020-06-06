import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';
import OrdersProducts from '../entities/OrdersProducts';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const order_products: OrdersProducts[] = products.map(prod => {
      const orderReturn = new OrdersProducts();
      Object.assign(orderReturn, {
        price: prod.price,
        quantity: prod.quantity,
        product_id: prod.product_id,
      });

      return orderReturn;
    });
    const order = this.ormRepository.create({
      customer,
      order_products,
    });

    await this.ormRepository.save(order);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne(id);
    return order;
  }
}

export default OrdersRepository;
