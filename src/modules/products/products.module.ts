import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductModel } from './models/product.model';
import { ScheduleProductsModel } from '@modules/schedules/models/schedule-products.model';

@Module({
	imports: [SequelizeModule.forFeature([ProductModel, ScheduleProductsModel])],
	providers: [ProductsService],
	controllers: [ProductsController],
	exports: [ProductsService]
})
export class ProductsModule {}
