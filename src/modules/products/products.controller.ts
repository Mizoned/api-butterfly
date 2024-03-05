import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProductsService } from "./products.service";

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    async findAll() {
        return await this.productsService.findAll();
    }

    @Get('/:id')
    async findOne(@Param('id') id: number) {
        return await this.productsService.findOne(id);
    }

    @Post('/')
    public async create(@Body() productDto: any) {
        return await this.productsService.create(productDto);
    }

    @Put(':id')
    public async update(@Param('id') id: number, @Body() productDto: any) {
        return await this.productsService.update(id, productDto);
    }

    @Delete(':id')
    public async delete(@Param('id') id: number) {
        return await this.productsService.delete(id);
    }
}
