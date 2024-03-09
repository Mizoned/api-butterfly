import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ExpensesModel } from '@modules/expenses/models/expenses.model';
import { ApiException } from '@common/exceptions/api.exception';
import { CreateExpensesDto } from '@modules/expenses/dto/create-expenses.dto';
import { UpdateExpensesDto } from '@modules/expenses/dto/update-expenses.dto';

@Injectable()
export class ExpensesService {
    constructor(@InjectModel(ExpensesModel) private readonly expensesRepository: typeof ExpensesModel) {}

    async findAll(userId: number): Promise<ExpensesModel[]> {
        return this.expensesRepository.findAll({
            where: { userId }
        });
    }

    async findOne(id: number, userId: number): Promise<ExpensesModel> {
        const expense = await this.expensesRepository.findOne({
            where: { id, userId }
        });

        if (!expense) {
            throw new ApiException('Расход не найден', HttpStatus.NOT_FOUND);
        }

        if (expense.userId !== userId) {
            throw new ApiException('У вас нет прав на просмотр расхода', HttpStatus.FORBIDDEN);
        }

        return expense;
    }

    async create(userId: number, expensesDto: CreateExpensesDto): Promise<ExpensesModel> {
        try {
            return await this.expensesRepository.create({
                ...expensesDto,
                userId
            });
        } catch (e) {
            throw new ApiException('Не удалось создать расход', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(id: number, userId: number, expensesDto: UpdateExpensesDto): Promise<ExpensesModel> {
        const expense = await this.expensesRepository.findByPk(id);

        if (!expense) {
            throw new ApiException('Расход не найден', HttpStatus.NOT_FOUND);
        }

        if (expense.userId !== userId) {
            throw new ApiException('У вас нет прав на обновление расхода', HttpStatus.FORBIDDEN);
        }

        try {
            await expense.update(expensesDto);
            return expense;
        } catch (e) {
            throw new ApiException('Не удалось обновить данные о расходе', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id: number, userId: number): Promise<{ deletedCount: number }> {
        const expense = await this.expensesRepository.findByPk(id);

        if (!expense) {
            throw new ApiException('Расход не найден', HttpStatus.NOT_FOUND);
        }

        if (expense.userId !== userId) {
            throw new ApiException('У вас нет прав на удаление расхода', HttpStatus.FORBIDDEN);
        }

        const deletedCount = await this.expensesRepository.destroy({ where: { id } });

        if (deletedCount === 0) {
            throw new ApiException('Не удалось удалить расход', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return { deletedCount };
    }
}
