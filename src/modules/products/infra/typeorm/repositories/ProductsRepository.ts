import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
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
    const products = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(products);

    return products;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({
      where: { name },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProducts = await this.ormRepository.findByIds(products);

    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsId = products.map(product => product.id);

    const listProducts = await this.ormRepository.find({
      where: {
        id: In(productsId),
      },
    });

    listProducts.forEach(product => {
      const productUpdated = products.find(
        findProduct => findProduct.id === product.id,
      );

      if (!productUpdated) {
        throw new AppError('No products founded');
      }

      Object.assign(product, { quantity: productUpdated.quantity });
    });

    await this.ormRepository.save(listProducts);

    return listProducts;
  }
}

export default ProductsRepository;
