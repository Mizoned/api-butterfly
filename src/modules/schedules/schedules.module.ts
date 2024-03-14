import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModel } from '@modules/schedules/models/schedule.model';
import { ScheduleProductsModel } from '@modules/schedules/models/schedule-products.model';
import { ProductsModule } from '@modules/products/products.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
      SequelizeModule.forFeature([ScheduleModel, ScheduleProductsModel]),
      ProductsModule,
      UsersModule
  ],
  providers: [ SchedulesService ],
  controllers: [ SchedulesController ]
})
export class SchedulesModule {}
