import {CustomerModel} from "@modules/customers/models/customer.model";

export class StatisticsCustomersSummaryDto {
    totalCustomers: {
        count: number,
        newCustomers: number
    }

    visits: {
        count: number,
        newVisits: number
    }

    activeCustomer: {
        customer: CustomerModel,
        visits: number
    }
}