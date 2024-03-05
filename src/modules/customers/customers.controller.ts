import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import { CustomersService } from "./customers.service";

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Get()
    async findAll() {
        return await this.customersService.findAll();
    }

    @Get('/:id')
    async findOne(@Param('id') id: number) {
        return await this.customersService.findOne(id);
    }

    @Post('/')
    public async create(@Body() customerDto: any) {
        return await this.customersService.create(customerDto);
    }

    @Put(':id')
    public async update(@Param('id') id: number, @Body() customerDto: any) {
        return await this.customersService.update(id, customerDto);
    }

    @Delete(':id')
    public async delete(@Param('id') id: number) {
        return await this.customersService.delete(id);
    }
}
