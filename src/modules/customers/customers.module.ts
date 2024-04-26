import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomerModel } from './models/customer.model';

@Module({
	imports: [SequelizeModule.forFeature([CustomerModel])],
	providers: [CustomersService],
	controllers: [CustomersController],
	exports: [CustomersService]
})
export class CustomersModule {}
