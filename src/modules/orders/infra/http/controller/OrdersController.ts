import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.body;
    const service = container.resolve(FindOrderService);
    return response.json(await service.execute({ id }));
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;
    const service = container.resolve(CreateOrderService);
    return response.json(await service.execute({ customer_id, products }));
  }
}
