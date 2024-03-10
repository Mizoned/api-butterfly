import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModel } from '@modules/schedule/models/schedule.model';
import { ScheduleProductsModel } from '@modules/schedule/models/schedule-products.model';

@Module({
  imports: [ SequelizeModule.forFeature([ScheduleModel, ScheduleProductsModel]) ],
  providers: [ ScheduleService ],
  controllers: [ ScheduleController ]
})
export class ScheduleModule {}
