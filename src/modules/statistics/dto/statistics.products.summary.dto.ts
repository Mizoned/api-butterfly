export class StatisticsProductsSummaryDto {
    totalProducts: {
        count: number,
        newCountProducts: number
    }

    popularProduct: {
        name: string,
        income: number,
        count: number
    }

    profitableProduct: {
        name: string,
        income: number,
        count: number
    }
}