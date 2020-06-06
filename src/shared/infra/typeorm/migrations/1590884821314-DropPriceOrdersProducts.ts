import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class DropPriceOrdersProducts1590884821314
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders_products', 'price');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders_products',
      new TableColumn({
        name: 'price',
        type: 'decimal(10,2)',
        isNullable: false,
      }),
    );
  }
}
