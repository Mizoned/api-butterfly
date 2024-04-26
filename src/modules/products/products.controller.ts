import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from '@modules/products/dto/create-product.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';

@ApiTags('Услуги пользователя')
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@ApiOperation({ summary: 'Получение всех услуг' })
	@Get('/')
	async findAll(@CurrentUser() user: IJwtPayload) {
		return await this.productsService.findAll(user.id);
	}

	@ApiOperation({ summary: 'Получение услуги по id' })
	@Get('/:id')
	async findOne(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
		return await this.productsService.findOne(id, user.id);
	}

	@ApiOperation({ summary: 'Создание услуги' })
	@Post('/')
	public async create(@CurrentUser() user: IJwtPayload, @Body() productDto: CreateProductDto) {
		return await this.productsService.create(user.id, productDto);
	}

	@ApiOperation({ summary: 'Обновление услуги' })
	@Put(':id')
	public async update(
		@Param('id') id: number,
		@CurrentUser() user: IJwtPayload,
		@Body() productDto: CreateProductDto
	) {
		return await this.productsService.update(id, user.id, productDto);
	}

	@ApiOperation({ summary: 'Удаление услуги' })
	@Delete(':id')
	public async delete(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
		return await this.productsService.delete(id, user.id);
	}
}
