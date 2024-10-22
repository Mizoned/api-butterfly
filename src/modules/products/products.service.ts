import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductModel, StatusProduct } from './models/product.model';
import { CreateProductDto } from '@modules/products/dto/create-product.dto';
import { UpdateProductDto } from '@modules/products/dto/update-product.dto';
import { ApiException } from '@common/exceptions/api.exception';

@Injectable()
export class ProductsService {
	constructor(
		@InjectModel(ProductModel) private readonly productsRepository: typeof ProductModel
	) {}

	async findAll(userId: number): Promise<ProductModel[]> {
		return this.productsRepository.findAll({
			where: { userId, status: StatusProduct.ACTIVE }
		});
	}

	async findOne(id: number, userId: number): Promise<ProductModel> {
		const product = await this.productsRepository.findOne({
			where: { id, userId, status: StatusProduct.ACTIVE }
		});

		if (!product) {
			throw new ApiException('Услуга не найдена', HttpStatus.NOT_FOUND);
		}

		return product;
	}

	async findAllByIds(ids: number[], userId: number) {
		return await this.productsRepository.findAll({ where: { id: ids, userId } });
	}

	async create(userId: number, productDto: CreateProductDto): Promise<ProductModel> {
		try {
			return await this.productsRepository.create({ ...productDto, userId });
		} catch (e) {
			throw new ApiException('Не удалось создать услугу', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async update(id: number, userId: number, productDto: UpdateProductDto): Promise<ProductModel> {
		const product = await this.findOne(id, userId);

		try {
			await product.update(productDto);
			return product;
		} catch (e) {
			throw new ApiException(
				'Не удалось обновить данные об услуге',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	async delete(id: number, userId: number): Promise<{ deletedCount: number }> {
		const product = await this.findOne(id, userId);

		try {
			await product.destroy();
			return { deletedCount: 1 };
		} catch (e) {
			throw new ApiException('Не удалось удалить продукт', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
