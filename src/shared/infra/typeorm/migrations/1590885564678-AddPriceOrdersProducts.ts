import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddPriceOrdersProducts1590885564678
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders_products',
      new TableColumn({
        name: 'price',
        type: 'decimal(10,2)',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders_products', 'price');
  }
}
