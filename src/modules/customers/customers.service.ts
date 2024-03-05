import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CustomerModel } from './models/customer.model';

@Injectable()
export class CustomersService {
    constructor(@InjectModel(CustomerModel) private readonly customersRepository: typeof CustomerModel) {}

    async findAll() {
        return [];
    }

    async findOne(id: number) {
        return id;
    }

    async create(customerDto: any) {
        return customerDto;
    }

    async update(id: number, customerDto: any) {
        return id;
    }

    async delete(id: number) {
        return id;
    }
}
