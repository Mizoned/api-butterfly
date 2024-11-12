import { Injectable } from '@nestjs/common';
import { ProductsService } from '@modules/products/products.service';
import { CustomersService } from '@modules/customers/customers.service';
import { SchedulesService } from '@modules/schedules/schedules.service';

@Injectable()
export class StatisticsService {
    constructor(
        private readonly productsService: ProductsService,
        private readonly customersService: CustomersService,
        private readonly scheduleService: SchedulesService
    ) {}

    async getSummaryStatistics(userId: number) {
        return {
            totalSchedules: await this.scheduleService.getTotalCountSchedules(userId),
            totalRevenue: await this.scheduleService.getAllRevenue(userId),
            totalCustomers: await this.customersService.getTotalCountCustomers(userId, new Date())
        }
    }

    async getOverviewStatistics(userId: number) {
        return {
            totalSchedules: await this.scheduleService.getTotalCountSchedules(userId),
            totalRevenue: await this.scheduleService.getAllRevenue(userId),
            totalCustomers: await this.customersService.getTotalCountCustomers(userId, new Date()),
            profitableProducts: await this.scheduleService.getAllRevenueDataByProducts(userId),
            todaySchedules: await this.scheduleService.getTodaySchedules(userId),
            dailyRevenue: await this.scheduleService.getDailyRevenue(userId),
            totalSchedulesByStatuses: await this.scheduleService.getTotalCountSchedulesByStatuses(userId)
        }
    }

    async getSummaryStatisticsByCustomers(userId: number) {
        return {
            totalCustomers: await this.customersService.getTotalCountCustomers(userId, new Date()),
            activeCustomer: await this.scheduleService.getActiveCustomer(userId, new Date()),
            totalVisits: await this.scheduleService.getVisits(userId)
        }
    }

    async getOverviewStatisticsByCustomers(userId: number) {
        return {
            profitableCustomers: await this.scheduleService.getAllRevenueDataByCustomers(userId),
            untrustedCustomers: await this.scheduleService.getUnreliableCustomers(userId),
            totalCustomers: await this.customersService.getTotalCountCustomers(userId, new Date()),
            activeCustomer: await this.scheduleService.getActiveCustomer(userId, new Date()),
            totalVisits: await this.scheduleService.getVisits(userId)
        };
    }

    async getSummaryStatisticsByProducts(userId: number) {
        return {
            totalProducts: await this.productsService.getTotalCountProducts(userId),
            ...await this.scheduleService.getPopularAndProfitableProducts(userId),
        }
    }

    async getOverviewStatisticsByProducts(userId: number) {
        return {
            profitableProducts: await this.scheduleService.getAllRevenueDataByProducts(userId),
            servicesCountPerDay: await this.scheduleService.getServicesCountPerDay(userId),
            totalProducts: await this.productsService.getTotalCountProducts(userId),
            ...await this.scheduleService.getPopularAndProfitableProducts(userId),
        }
    }

    async getSummaryStatisticsByProcessedSchedules(userId: number) {
        return await this.scheduleService.getStatisticsByProcessedSchedules(userId);
    }

    async getSummaryStatisticsBySuccessSchedules(userId: number) {
        return {
            totalSchedules: await this.scheduleService.getTotalCountSuccessSchedules(userId),
            totalRevenue: await this.scheduleService.getAllRevenue(userId),
            avgBill: await this.scheduleService.getAvgBill(userId)
        };
    }

    async getSummaryStatisticsByCanceledSchedules(userId: number) {
        return {
            totalSchedules: await this.scheduleService.getTotalCountCanceledSchedules(userId),
            percentCanceledSchedules: await this.scheduleService.getPercentageCanceledSchedules(userId),
            lostRevenue: await this.scheduleService.getLostRevenue(userId)
        };
    }
}
