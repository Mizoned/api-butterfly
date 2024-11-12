import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from '@modules/statistics/statistics.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';

@Controller('statistics')
export class StatisticsController {
    constructor(
        private readonly statisticsService: StatisticsService,
    ) {}

    @Get('/summary')
    async getSummaryStatistics(@CurrentUser() user: IJwtPayload) {
        return await this.statisticsService.getSummaryStatistics(user.id);
    }

    @Get('/overview')
    async getOverviewStatistics(@CurrentUser() user: IJwtPayload) {
        return await this.statisticsService.getOverviewStatistics(user.id);
    }

    @Get('/customers/summary')
    async getSummaryStatisticsByCustomers(@CurrentUser() user: IJwtPayload) {
        return await this.statisticsService.getSummaryStatisticsByCustomers(user.id);
    }

    @Get('/customers/overview')
    async getOverviewStatisticsByCustomers(@CurrentUser() user: IJwtPayload) {
        return await this.statisticsService.getOverviewStatisticsByCustomers(user.id)
    }

    @Get('/products/summary')
    async getSummaryStatisticsByProducts(@CurrentUser() user: IJwtPayload) {
        return await this.statisticsService.getSummaryStatisticsByProducts(user.id);
    }

    @Get('/products/overview')
    async getOverviewStatisticsByProducts(@CurrentUser() user: IJwtPayload) {
        return await this.statisticsService.getOverviewStatisticsByProducts(user.id);
    }

    @Get('/schedules/processed/summary')
    async getSummaryStatisticsByProcessedProducts(@CurrentUser() user: IJwtPayload) {
        return await this.statisticsService.getSummaryStatisticsByProcessedSchedules(user.id);
    }

    @Get('/schedules/success/summary')
    async getSummaryStatisticsBySuccessProducts(@CurrentUser() user: IJwtPayload) {
        return await this.statisticsService.getSummaryStatisticsBySuccessSchedules(user.id);
    }

    @Get('/schedules/canceled/summary')
    async getSummaryStatisticsByCanceledProducts(@CurrentUser() user: IJwtPayload) {
        return await this.statisticsService.getSummaryStatisticsByCanceledSchedules(user.id);
    }
}
