import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ExpensesService } from '@modules/expenses/expenses.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';
import { CreateExpensesDto } from '@modules/expenses/dto/create-expenses.dto';
import { UpdateExpensesDto } from '@modules/expenses/dto/update-expenses.dto';

@ApiTags('Расходы пользователя')
@Controller('expenses')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) {}

    @ApiOperation({ summary: 'Получение всех расходов' })
    @Get('/')
    async findAll(@CurrentUser() user: IJwtPayload) {
        return await this.expensesService.findAll(user.id);
    }

    @ApiOperation({ summary: 'Получение расхода по id' })
    @Get(':id')
    async findOne(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
        return this.expensesService.findOne(id, user.id)
    }

    @ApiOperation({ summary: 'Создание расхода' })
    @Post('/')
    async create(@CurrentUser() user: IJwtPayload, expensesDto: CreateExpensesDto) {
        return this.expensesService.create(user.id, expensesDto);
    }

    @ApiOperation({ summary: 'Обновление расхода' })
    @Put(':id')
    async update(@Param('id') id: number, @CurrentUser() user: IJwtPayload, expensesDto: UpdateExpensesDto) {
        return this.expensesService.update(id, user.id, expensesDto);
    }

    @ApiOperation({ summary: 'Удаление расхода' })
    @Delete(':id')
    async delete(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
        return await this.expensesService.delete(id, user.id);
    }
}
