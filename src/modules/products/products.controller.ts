import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Услуги пользователя')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @ApiOperation({ summary: 'Получение всех услуг' })
    @Get()
    async findAll() {
        return await this.productsService.findAll();
    }

    @ApiOperation({ summary: 'Получение услуги по id' })
    @Get('/:id')
    async findOne(@Param('id') id: number) {
        return await this.productsService.findOne(id);
    }

    @ApiOperation({ summary: 'Создание услуги' })
    @Post('/')
    public async create(@Body() productDto: any) {
        return await this.productsService.create(productDto);
    }

    @ApiOperation({ summary: 'Обновление услуги' })
    @Put(':id')
    public async update(@Param('id') id: number, @Body() productDto: any) {
        return await this.productsService.update(id, productDto);
    }

    @ApiOperation({ summary: 'Удаление услуги' })
    @Delete(':id')
    public async delete(@Param('id') id: number) {
        return await this.productsService.delete(id);
    }
}
