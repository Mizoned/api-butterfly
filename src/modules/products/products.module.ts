import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductModel } from './models/product.model';

@Module({
  imports: [ SequelizeModule.forFeature([ProductModel]) ],
  providers: [ ProductsService ],
  controllers: [ ProductsController ],
  exports: []
})
export class ProductsModule {}
