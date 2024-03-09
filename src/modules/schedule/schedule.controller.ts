import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from '@modules/schedule/schedule.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';
import { CreateScheduleDto } from '@modules/schedule/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@modules/schedule/dto/update-schedule.dto';

@ApiTags('Расписание пользователя')
@Controller('schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) {}

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
