import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductModel } from './models/product.model';
import { CreateProductDto } from '@modules/products/dto/create-product.dto';
import { UpdateProductDto } from '@modules/products/dto/update-product.dto';
import { ApiException } from '@common/exceptions/api.exception';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(ProductModel) private readonly productsRepository: typeof ProductModel) {}

    async findAll(userId: number): Promise<ProductModel[]> {
        return this.productsRepository.findAll({
            where: { userId }
        });
    }

    async findOne(id: number, userId: number): Promise<ProductModel> {
        const product = await this.productsRepository.findOne({
            where: { id, userId }
        });

        if (!product) {
            throw new ApiException('Услуга не найдена', HttpStatus.NOT_FOUND);
        }

        if (product.userId !== userId) {
            throw new ApiException('У вас нет прав на просмотр услуги', HttpStatus.FORBIDDEN);
        }

        return product;
    }

    async findAllByIds(ids: number[], userId: number) {
        return await this.productsRepository.findAll({ where: { id: ids, userId }});
    }

    async create(userId: number, productDto: CreateProductDto): Promise<ProductModel> {
        try {
            return await this.productsRepository.create({ ...productDto, userId });
        } catch (e) {
            throw new ApiException('Не удалось создать услугу', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(id: number, userId: number, productDto: UpdateProductDto): Promise<ProductModel> {
        const product = await this.productsRepository.findByPk(id);

        if (!product) {
            throw new ApiException('Услуга не найдена', HttpStatus.NOT_FOUND);
        }

        if (product.userId !== userId) {
            throw new ApiException('У вас нет прав на обновление услуги', HttpStatus.FORBIDDEN);
        }

        try {
            await product.update(productDto);
            return product;
        } catch (e) {
            throw new ApiException('Не удалось обновить данные об услуге', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id: number, userId: number): Promise<{ deletedCount: number }> {
        const product = await this.productsRepository.findByPk(id);

        if (!product) {
            throw new ApiException('Услуга не найден', HttpStatus.NOT_FOUND);
        }

        if (product.userId !== userId) {
            throw new ApiException('У вас нет прав на удаление услуги', HttpStatus.FORBIDDEN);
        }

        const deletedCount = await this.productsRepository.destroy({ where: { id } });

        if (deletedCount === 0) {
            throw new ApiException('Не удалось удалить продукт', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return { deletedCount };
    }
}
