import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';
import { CreateCustomerDto } from '@modules/customers/dto/create-customer.dto';
import { UpdateCustomerDto } from '@modules/customers/dto/update-customer.dto';
import { CustomerModel } from '@modules/customers/models/customer.model';

@ApiTags('Клиенты пользователя')
@Controller('customers')
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@ApiOperation({ summary: 'Получение всех клиентов' })
	@Get('/')
	async findAll(@CurrentUser() user: IJwtPayload) {
		return await this.customersService.findAll(user.id);
	}

	@ApiOperation({ summary: 'Получение клиента по id' })
	@Get('/:id')
	async findOne(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
		return await this.customersService.findOne(id, user.id);
	}

	@ApiOperation({ summary: 'Создание клиента' })
	@Post('/')
	public async create(@CurrentUser() user: IJwtPayload, @Body() customerDto: CreateCustomerDto) {
		return await this.customersService.create(user.id, customerDto);
	}

	@ApiOperation({ summary: 'Обновление клиента' })
	@Put(':id')
	public async update(
		@Param('id') id: number,
		@CurrentUser() user: IJwtPayload,
		@Body() customerDto: UpdateCustomerDto
	) {
		return await this.customersService.update(id, user.id, customerDto);
	}

	@ApiOperation({ summary: 'Удаление клиента' })
	@Delete(':id')
	public async delete(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
		return await this.customersService.delete(id, user.id);
	}
}
