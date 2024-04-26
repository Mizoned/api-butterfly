import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiOperation({ summary: 'Получение пользователя по id' })
	@Get('/:id')
	async findOne(@Param('id') id: number) {
		return await this.usersService.findOne(id);
	}
}
