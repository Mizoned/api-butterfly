import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductModel } from './models/product.model';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(ProductModel) private readonly productsRepository: typeof ProductModel) {}

    async findAll() {
        return [];
    }

    async findOne(id: number) {
        return id;
    }

    async create(productDto: any) {
        return productDto;
    }

    async update(id: number, productDto: any) {
        return id;
    }

    async delete(id: number) {
        return id;
    }
}
