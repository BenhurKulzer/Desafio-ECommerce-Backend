import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    return this.ormRepository.findOne({ where: { name } });
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    return this.ormRepository.findByIds(products.map(prod => prod.id));
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsReturn = await this.ormRepository.findByIds(
      products.map(prod => prod.id),
    );

    products.forEach(productUpdate => {
      const productToBeUpdated = productsReturn.find(
        prod => productUpdate.id === prod.id,
      );
      if (productToBeUpdated) {
        productToBeUpdated.quantity -= productUpdate.quantity;
      }
    });

    await this.ormRepository.save(productsReturn);

    return productsReturn;
  }
}

export default ProductsRepository;
