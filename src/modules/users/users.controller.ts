import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from "./users.service";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll() {
        return await this.usersService.findAll();
    }

    @Get('/:id')
    async findOne(@Param('id') id: number) {
        return await this.usersService.findOne(id);
    }

    @Post('/')
    public async create(@Body() productDto: any) {
        return await this.usersService.create(productDto);
    }

    @Put(':id')
    public async update(@Param('id') id: number, @Body() productDto: any) {
        return await this.usersService.update(id, productDto);
    }

    @Delete(':id')
    public async delete(@Param('id') id: number) {
        return await this.usersService.delete(id);
    }
}
