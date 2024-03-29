import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    //TODO В будущем закрыть доступ/удалить контроллер для CRUD пользователя
    //TODO Переделать CRUD ЛК для пользователя, возможно вынести в другую сущьность с настроками пользователя

    @ApiOperation({ summary: 'Получение всех пользователей' })
    @Get('/')
    async findAll() {
        return await this.usersService.findAll();
    }

    @ApiOperation({ summary: 'Получение пользователя по id' })
    @Get('/:id')
    async findOne(@Param('id') id: number) {
        return await this.usersService.findOne(id);
    }

    @ApiOperation({ summary: 'Создание пользователя' })
    @Post('/')
    public async create(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @ApiOperation({ summary: 'Обновление пользователя' })
    @Put(':id')
    public async update(@Param('id') id: number, @Body() productDto: any) {
        return await this.usersService.update(id, productDto);
    }

    @ApiOperation({ summary: 'Удаление пользователя' })
    @Delete(':id')
    public async delete(@Param('id') id: number) {
        return await this.usersService.delete(id);
    }
}
