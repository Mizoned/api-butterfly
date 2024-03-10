import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SchedulesService } from '@modules/schedules/schedules.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';
import { CreateScheduleDto } from '@modules/schedules/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@modules/schedules/dto/update-schedule.dto';

@ApiTags('Расписание пользователя')
@Controller('schedule')
export class SchedulesController {
    constructor(private readonly scheduleService: SchedulesService) {}

    @ApiOperation({ summary: 'Получение всех расписаний' })
    @Get('/')
    async findAll(@CurrentUser() user: IJwtPayload) {
        return await this.scheduleService.findAll(user.id)
    }

    @ApiOperation({ summary: 'Получение расписания по id' })
    @Get(':id')
    async findOne(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
        return await this.scheduleService.findOne(id, user.id);
    }

    @ApiOperation({ summary: 'Создание расписания' })
    @Post('/')
    async create(@CurrentUser() user: IJwtPayload, scheduleDto: CreateScheduleDto) {
        return await this.scheduleService.create(user.id, scheduleDto);
    }

    @ApiOperation({ summary: 'Обновление расписания' })
    @Put(':id')
    async update(@Param('id') id: number, @CurrentUser() user: IJwtPayload, scheduleDto: UpdateScheduleDto) {
        return await this.scheduleService.update(id, user.id, scheduleDto);
    }

    @ApiOperation({ summary: 'Удаление расписания' })
    @Delete(':id')
    async delete(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
        return await this.scheduleService.delete(id, user.id);
    }
}