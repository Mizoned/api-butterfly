import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { ProductsModule } from '@modules/products/products.module';
import { CustomersModule } from '@modules/customers/customers.module';
import { SchedulesModule } from '@modules/schedules/schedules.module';

@Module({
    imports: [
        ProductsModule,
        CustomersModule,
        SchedulesModule
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService]
})
export class StatisticsModule {}
