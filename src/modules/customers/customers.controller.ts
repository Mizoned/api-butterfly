import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('Клиенты пользователя')
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @ApiOperation({ summary: 'Получение всех клиентов' })
    @Get()
    async findAll() {
        return await this.customersService.findAll();
    }

    @ApiOperation({ summary: 'Получение клиента по id' })
    @Get('/:id')
    async findOne(@Param('id') id: number) {
        return await this.customersService.findOne(id);
    }

    @ApiOperation({ summary: 'Создание клиента' })
    @Post('/')
    public async create(@Body() customerDto: any) {
        return await this.customersService.create(customerDto);
    }

    @ApiOperation({ summary: 'Обновление клиента' })
    @Put(':id')
    public async update(@Param('id') id: number, @Body() customerDto: any) {
        return await this.customersService.update(id, customerDto);
    }

    @ApiOperation({ summary: 'Удаление клиента' })
    @Delete(':id')
    public async delete(@Param('id') id: number) {
        return await this.customersService.delete(id);
    }
}
