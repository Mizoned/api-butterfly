import { HttpStatus, Injectable } from '@nestjs/common';
import { ScheduleModel } from '@modules/schedules/models/schedule.model';
import { ApiException } from '@common/exceptions/api.exception';
import { CreateScheduleDto } from '@modules/schedules/dto/create-schedule.dto';
import { InjectModel } from '@nestjs/sequelize';
import { ProductModel } from '@modules/products/models/product.model';
import { ProductsService } from '@modules/products/products.service';
import { SettingsService } from '@modules/settings/settings.service';
import { CustomersService } from '@modules/customers/customers.service';

@Injectable()
export class SchedulesService {
    constructor(
        @InjectModel(ScheduleModel) private readonly scheduleRepository: typeof ScheduleModel,
        private readonly productsService: ProductsService,
        private readonly settingsService: SettingsService,
        private readonly customersService: CustomersService,
    ) {}

    async findAll(userId: number): Promise<ScheduleModel[]> {
        return this.scheduleRepository.findAll({
            where: { userId },
            include: {
                model: ProductModel,
                through: {
                    attributes: ['priceAtSale', 'quantity'],
                    as: 'additional'
                }
            }
        });
    }

    async findOne(id: number, userId: number): Promise<ScheduleModel> {
        return await this.validateScheduleAccess(id, userId);
    }

    private async validateScheduleAccess(id: number, userId: number): Promise<ScheduleModel> {
        let schedule = await this.scheduleRepository.findByPk(id, {
            include: {
                model: ProductModel,
                through: {
                    attributes: ['priceAtSale', 'quantity'],
                    as: 'additional'
                }
            }
        });

        if (!schedule) {
            throw new ApiException('Расписание не найдено', HttpStatus.NOT_FOUND);
        }

        if (schedule.userId !== userId) {
            throw new ApiException('У вас недостаочно прав', HttpStatus.FORBIDDEN);
        }

        return schedule;
    }

    async findFreeTimeSlots(userId: number, date: string): Promise<string[]> {
        const userSettings = await this.settingsService.findOne(userId);
        const startOfDay = this.createScheduleDate(date, userSettings.workdayStartTime);
        const endOfDay = this.createScheduleDate(date, userSettings.workdayEndTime);

        const timeSlots: string[] = [];
        let lastEndTime = new Date(startOfDay);

        const schedules = await this.scheduleRepository.findAll({
            attributes: ['date', 'timeStart', 'timeEnd'],
            where: {
                date,
                userId
            },
            order: [['timeStart', 'ASC']],
        });

        if (schedules.length === 0) {
            timeSlots.push(`${this.getFormatTime(startOfDay)} - ${this.getFormatTime(endOfDay)}`);
            return timeSlots;
        }

        schedules.forEach((schedule) => {
            const timeStart = this.createScheduleDate(schedule.date, schedule.timeStart);
            const timeEnd = this.createScheduleDate(schedule.date, schedule.timeEnd);

            if (timeStart > lastEndTime) {
                timeSlots.push(`${this.getFormatTime(lastEndTime)} - ${this.getFormatTime(timeStart)}`);
            }

            lastEndTime = timeEnd;
        });

        if (lastEndTime < endOfDay) {
            timeSlots.push(`${this.getFormatTime(lastEndTime)} - ${this.getFormatTime(endOfDay)}`);
        }

        return timeSlots;
    }

    private getFormatTime(date: Date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${ hours < 10 ? '0' + hours : hours }:${ minutes < 10 ? '0' + minutes : minutes }`;
    }

    private createScheduleDate(date: string, time: string): Date {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(date);
        dateTime.setHours(hours, minutes);

        return dateTime;
    }

    async create(userId: number, scheduleDto: CreateScheduleDto): Promise<any> {
        const customer = await this.validateCustomer(scheduleDto.customerId, userId);

        const isOccupied = await this.validateTimeSlot(userId, scheduleDto);

        const products = await this.validateProducts(scheduleDto, userId);

        return this.createTransaction(userId, scheduleDto, products);
    }

    private async validateCustomer(customerId: number, userId: number) {
        const customer = await this.customersService.findOne(customerId, userId);

        if (!customer) {
            throw new ApiException('Ошибка валидации', HttpStatus.BAD_REQUEST, [
                { property: "customerId", message: "Клиент не найден" }
            ]);
        }

        return customer;
    }

    private async validateTimeSlot(userId: number, scheduleDto: CreateScheduleDto, excludeScheduleId?: number): Promise<boolean> {
        const { startOfDay, endOfDay } = await this.getUserWorkdaySettings(userId, scheduleDto.date);
        const scheduleStartDate = this.createScheduleDate(scheduleDto.date, scheduleDto.timeStart);
        const scheduleEndDate = this.createScheduleDate(scheduleDto.date, scheduleDto.timeEnd);

        if (scheduleStartDate < startOfDay) {
            throw new ApiException('Ошибка валидации', HttpStatus.BAD_REQUEST, [
                { property: "timeStart", message: "Время записи не может быть меньше, чем начало вашего рабочего дня" }
            ]);
        }

        if (scheduleEndDate > endOfDay) {
            throw new ApiException('Ошибка валидации', HttpStatus.BAD_REQUEST, [
                { property: "timeEnd", message: "Время записи не может быть больше, чем конец вашего рабочего дня" }
            ]);
        }

        let schedules: ScheduleModel[] = await this.scheduleRepository.findAll({
            attributes: ['id', 'timeStart', 'timeEnd'],
            where: {
                date: scheduleDto.date,
                userId
            }
        });

        if (excludeScheduleId) {
            schedules = [...schedules].filter((schedule) => schedule.id === excludeScheduleId);
        }

        const isOccupied = this.checkSlotOccupancy(schedules, scheduleDto);

        if (isOccupied) {
            throw new ApiException('Ошибка валидации', HttpStatus.BAD_REQUEST, [
                { property: "timeStart", message: "Это время уже занято или произошло наложение записей" },
                { property: "timeEnd", message: "Это время уже занято или произошло наложение записей" }
            ]);
        }

        return isOccupied;
    }

    private async getUserWorkdaySettings(userId: number, date: string) {
        const userSettings = await this.settingsService.findOne(userId);
        const startOfDay = this.createScheduleDate(date, userSettings.workdayStartTime);
        const endOfDay = this.createScheduleDate(date, userSettings.workdayEndTime);

        return { startOfDay, endOfDay };
    }

    private checkSlotOccupancy(schedules: Partial<ScheduleModel[]>, scheduleDto: CreateScheduleDto): boolean {
        return schedules.some(schedule => {
            return (
                (scheduleDto.timeStart >= schedule.timeStart && scheduleDto.timeStart < schedule.timeEnd) ||
                (scheduleDto.timeEnd > schedule.timeStart && scheduleDto.timeEnd <= schedule.timeEnd) ||
                (scheduleDto.timeStart <= schedule.timeStart && scheduleDto.timeEnd >= schedule.timeEnd)
            );
        });
    }

    private async validateProducts(scheduleDto: CreateScheduleDto, userId: number): Promise<ProductModel[]> {
        const productIds = scheduleDto.products.map((product) => product.id);
        const products: ProductModel[] = await this.productsService.findAllByIds(productIds, userId);

        if (!products.length) {
            throw new ApiException('Ошибка валидации', HttpStatus.BAD_REQUEST, [
                { property: "products", message: "Указанные услуги не были найдены" }
            ]);
        }

        return products;
    }

    private async createTransaction(userId: number, scheduleDto: CreateScheduleDto, products: ProductModel[]): Promise<ScheduleModel> {
        const preparedScheduleData = this.prepareCreateScheduleData(userId, scheduleDto);

        let schedule: ScheduleModel | null = null;

        return await this.scheduleRepository.sequelize.transaction(async (transaction) => {
            schedule = await this.scheduleRepository.create(preparedScheduleData, { transaction });

            for (const product of products) {
                const productPrice = product.price;
                const productQuantity: number = scheduleDto.products.find((p) => p.id === product.id).quantity;

                await schedule.$add('products', product, {
                    through: {
                        quantity: productQuantity,
                        priceAtSale: productPrice
                    },
                    transaction
                });
            }
        }).then(() => {
            return schedule;
        }).catch((e) => {
            throw new ApiException('В процессе создания записи произошла ошибка', HttpStatus.INTERNAL_SERVER_ERROR);
        });
    }

    private prepareCreateScheduleData(userId: number, scheduleDto: CreateScheduleDto) {
        return {
            userId,
            customerId: scheduleDto.customerId,
            date: scheduleDto.date,
            timeStart: scheduleDto.timeStart,
            timeEnd: scheduleDto.timeEnd,
        }
    }

    async update(id: number, userId: number, scheduleDto: CreateScheduleDto): Promise<any> {
        const schedule = await this.validateScheduleAccess(id, userId);

        const customer = await this.validateCustomer(scheduleDto.customerId, userId);

        const isOccupied = await this.validateTimeSlot(userId, scheduleDto, id);

        const products = await this.validateProducts(scheduleDto, userId);

        return await this.updateTransaction(schedule, scheduleDto, products);
    }

    private async updateTransaction(schedule: ScheduleModel, scheduleDto: CreateScheduleDto, products: ProductModel[]): Promise<any> {
        const preparedScheduleData = this.prepareUpdateScheduleData(scheduleDto);

        await this.scheduleRepository.sequelize.transaction(async (transaction) => {
            await schedule.update(preparedScheduleData, { transaction });

            await schedule.$remove<ProductModel>('products', schedule.products);

            for (const product of products) {
                const productPrice: number = product.price;
                const productQuantity: number = scheduleDto.products.find((p) => p.id === product.id).quantity;

                await schedule.$add<ProductModel>('products', product, {
                    through: {
                        quantity: productQuantity,
                        priceAtSale: productPrice
                    },
                    transaction
                });
            }
        }).then(async () => {
            await schedule.reload({
                include: {
                    model: ProductModel,
                    through: {
                        attributes: ['priceAtSale', 'quantity'],
                        as: 'additional'
                    }
                }
            });
        }).catch((e) => {
            throw new ApiException('В процессе обновления записи произошла ошибка', HttpStatus.INTERNAL_SERVER_ERROR);
        });

        return schedule;
    }

    private prepareUpdateScheduleData(scheduleDto: CreateScheduleDto) {
        const { products, ...rest } = scheduleDto;
        return rest;
    }

    async delete(id: number, userId: number): Promise<{ deletedCount: number }> {
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
