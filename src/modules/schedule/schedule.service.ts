import { HttpStatus, Injectable } from '@nestjs/common';
import { ScheduleModel } from '@modules/schedule/models/schedule.model';
import { ApiException } from '@common/exceptions/api.exception';
import { CreateScheduleDto } from '@modules/schedule/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@modules/schedule/dto/update-schedule.dto';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ScheduleService {
    constructor(@InjectModel(ScheduleModel) private readonly scheduleRepository: typeof ScheduleModel) {}

    async findAll(userId: number): Promise<ScheduleModel[]> {
        return this.scheduleRepository.findAll({
            where: { userId }
        });
    }

    async findOne(id: number, userId: number): Promise<ScheduleModel> {
        const schedule = await this.scheduleRepository.findOne({
            where: { id, userId }
        });

        if (!schedule) {
            throw new ApiException('Расписание не найдено', HttpStatus.NOT_FOUND);
        }

        if (schedule.userId !== userId) {
            throw new ApiException('У вас нет прав на просмотр расписания', HttpStatus.FORBIDDEN);
        }

        return schedule;
    }

    async create(userId: number, scheduleDto: CreateScheduleDto) {
        const schedule = await this.scheduleRepository.create({
            ...scheduleDto,
            userId
        });

        return schedule;
    }

    async update(id: number, userId: number, scheduleDto: UpdateScheduleDto) {
        const schedule = await this.scheduleRepository.findByPk(id);

        if (!schedule) {
            throw new ApiException('Расписание не найдено', HttpStatus.NOT_FOUND);
        }

        if (schedule.userId !== userId) {
            throw new ApiException('У вас нет прав на обновление расписаиня', HttpStatus.FORBIDDEN);
        }

        try {
            await schedule.update(scheduleDto);
            return schedule;
        } catch (e) {
            throw new ApiException('Не удалось обновить данные о расписании', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id: number, userId: number) {
        const schedule = await this.scheduleRepository.findByPk(id);

        if (!schedule) {
            throw new ApiException('Расписание не найдено', HttpStatus.NOT_FOUND);
        }

        if (schedule.userId !== userId) {
            throw new ApiException('У вас нет прав на удаление расписания', HttpStatus.FORBIDDEN);
        }

        const deletedCount = await this.scheduleRepository.destroy({ where: { id } });

        if (deletedCount === 0) {
            throw new ApiException('Не удалось удалить расписание', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return { deletedCount };
    }
}
