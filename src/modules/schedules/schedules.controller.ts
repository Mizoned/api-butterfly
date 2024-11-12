import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SchedulesService } from '@modules/schedules/schedules.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';
import { CreateScheduleDto } from '@modules/schedules/dto/create-schedule.dto';
import { ScheduleStatus } from './interfaces';

@ApiTags('Расписание пользователя')
@Controller('schedules')
export class SchedulesController {
	constructor(private readonly scheduleService: SchedulesService) {}

	@ApiOperation({ summary: 'Получение всех расписаний' })
	@Get('/')
	async findAll(@CurrentUser() user: IJwtPayload) {
		return await this.scheduleService.findAll(user.id);
	}

	@Get('/processed')
	async findAllProcessed(@CurrentUser() user: IJwtPayload) {
		return await this.scheduleService.findAllByStatus(user.id, ScheduleStatus.PROCESS);
	}

	@Get('/completed')
	async findAllCompleted(@CurrentUser() user: IJwtPayload) {
		return await this.scheduleService.findAllByStatus(user.id, ScheduleStatus.SUCCESS);
	}

	@Get('/canceled')
	async findAllCanceled(@CurrentUser() user: IJwtPayload) {
		return await this.scheduleService.findAllByStatus(user.id, ScheduleStatus.CANCELED);
	}

	@Get('/today')
	async getTodaySchedules(@CurrentUser() user: IJwtPayload) {
		return await this.scheduleService.getTodaySchedules(user.id);
	}

	@ApiOperation({ summary: 'Получение расписания по id' })
	@Get(':id')
	async findOne(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
		return await this.scheduleService.findOne(id, user.id);
	}

	@ApiOperation({ summary: 'Создание расписания' })
	@Post('/')
	async create(@CurrentUser() user: IJwtPayload, @Body() scheduleDto: CreateScheduleDto) {
		return await this.scheduleService.create(user.id, scheduleDto);
	}

	@ApiOperation({ summary: 'Обновление расписания' })
	@Put(':id')
	async update(
		@Param('id') id: number,
		@CurrentUser() user: IJwtPayload,
		@Body() scheduleDto: CreateScheduleDto
	) {
		return await this.scheduleService.update(id, user.id, scheduleDto);
	}

	@ApiOperation({ summary: 'Удаление расписания' })
	@Delete(':id')
	async delete(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
		return await this.scheduleService.delete(id, user.id);
	}

	@ApiOperation({ summary: 'Отменить запись' })
	@Put('/cancel/:id')
	async cancel(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
		return await this.scheduleService.cancel(id, user.id);
	}

	@ApiOperation({ summary: 'Отменить запись' })
	@Put('/complete/:id')
	async complete(@Param('id') id: number, @CurrentUser() user: IJwtPayload) {
		return await this.scheduleService.compete(id, user.id);
	}

	@ApiOperation({ summary: 'Получение свободных слотов по выбранной дате' })
	@Get('slots/free/:date')
	async findFreeTimeSlots(@Param('date') date: string, @CurrentUser() user: IJwtPayload) {
		return await this.scheduleService.findFreeTimeSlots(user.id, date);
	}
}
