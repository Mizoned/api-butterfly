export class StatisticsSummaryDto {
    totalSchedules: {
        count: number,
        newCountSchedules: number
    }

    income: {
        total: number,
        totalInMonth: number
    }

    totalCustomers: {
        count: number,
        newCountCustomers: number
    }
}