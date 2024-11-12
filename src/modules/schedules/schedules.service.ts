import {HttpStatus, Injectable} from '@nestjs/common';
import {ScheduleModel} from '@modules/schedules/models/schedule.model';
import {ApiException} from '@common/exceptions/api.exception';
import {CreateScheduleDto} from '@modules/schedules/dto/create-schedule.dto';
import {InjectModel} from '@nestjs/sequelize';
import {ProductModel} from '@modules/products/models/product.model';
import {ProductsService} from '@modules/products/products.service';
import {SettingsService} from '@modules/settings/settings.service';
import {CustomersService} from '@modules/customers/customers.service';
import {CustomerModel} from '@modules/customers/models/customer.model';
import {Includeable, Op} from 'sequelize';
import {ScheduleStatus} from './interfaces';
import {getWeekDays, isCurrentMonth} from "@common/utils";
import {ScheduleProductsModel} from "@modules/schedules/models/schedule-products.model";

@Injectable()
export class SchedulesService {
    constructor(
        @InjectModel(ScheduleModel) private readonly scheduleRepository: typeof ScheduleModel,
        private readonly productsService: ProductsService,
        private readonly settingsService: SettingsService,
        private readonly customersService: CustomersService
    ) {}

    private ASSOCIATED_PROPERTY = 'details';

    private includeOptions: Includeable[] = [
        { model: CustomerModel },
        {
            model: ProductModel,
            through: {
                attributes: ['priceAtSale', 'quantity'],
                as: this.ASSOCIATED_PROPERTY
            }
        },
    ]

    async findAll(userId: number): Promise<ScheduleModel[]> {
        return await this.scheduleRepository.findAll({
            where: {userId},
            include: this.includeOptions,
            order: [['date', 'ASC'], ['timeStart', 'ASC']],
        });
    }

    async findAllAndCount(userId: number): Promise<{ rows: ScheduleModel[], count: number }> {
        return await this.scheduleRepository.findAndCountAll({
            where: { userId },
            include: this.includeOptions,
            distinct: true,
            order: [['date', 'ASC'], ['timeStart', 'ASC']],
        });
    }

    async findAllByStatus(userId: number, status: ScheduleStatus): Promise<ScheduleModel[]> {
        return await this.scheduleRepository.findAll({
            where: { userId, status },
            include: this.includeOptions,
            order: [['date', 'ASC'], ['timeStart', 'ASC']] //TODO переделать вынести отсюда
        });
    }

    async findOne(id: number, userId: number): Promise<ScheduleModel> {
        const schedule = await this.scheduleRepository.findOne({
            where: {id, userId},
            include: this.includeOptions
        });

        if (!schedule) {
            throw new ApiException('Расписание не найдено', HttpStatus.NOT_FOUND);
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
            order: [['timeStart', 'ASC']]
        });

        if (schedules.length === 0) {
            timeSlots.push(`${this.getFormatTime(startOfDay)} - ${this.getFormatTime(endOfDay)}`);
            return timeSlots;
        }

        schedules.forEach((schedule) => {
            const timeStart = this.createScheduleDate(schedule.date, schedule.timeStart);
            const timeEnd = this.createScheduleDate(schedule.date, schedule.timeEnd);

            if (timeStart > lastEndTime) {
                timeSlots.push(
                    `${this.getFormatTime(lastEndTime)} - ${this.getFormatTime(timeStart)}`
                );
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
        return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    }

    private createScheduleDate(date: string, time: string): Date {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(date);
        dateTime.setHours(hours, minutes);

        return dateTime;
    }

    async create(userId: number, scheduleDto: CreateScheduleDto): Promise<any> {
        await this.validateCustomer(scheduleDto.customerId, userId);

        await this.validateTimeSlot(userId, scheduleDto);

        const products = await this.validateProducts(scheduleDto, userId);

        const {id: scheduleId} = await this.createTransaction(userId, scheduleDto, products);

        return await this.findOne(scheduleId, userId);
    }

    private async validateCustomer(customerId: number, userId: number) {
        try {
            return await this.customersService.findOne(customerId, userId);
        } catch (e) {
            throw new ApiException('Ошибка валидации', HttpStatus.BAD_REQUEST, [
                {property: 'customerId', message: 'Клиент не найден'}
            ]);
        }
    }

    private async validateTimeSlot(
        userId: number,
        scheduleDto: CreateScheduleDto,
        excludeScheduleId?: number
    ): Promise<void> {
        const {startOfDay, endOfDay} = await this.getUserWorkdaySettings(
            userId,
            scheduleDto.date
        );
        const scheduleStartDate = this.createScheduleDate(scheduleDto.date, scheduleDto.timeStart);
        const scheduleEndDate = this.createScheduleDate(scheduleDto.date, scheduleDto.timeEnd);

        if (scheduleStartDate < startOfDay) {
            throw new ApiException('Ошибка валидации', HttpStatus.BAD_REQUEST, [
                {
                    property: 'timeStart',
                    message: 'Время записи не может быть меньше, чем начало вашего рабочего дня'
                }
            ]);
        }

        if (scheduleEndDate > endOfDay) {
            throw new ApiException('Ошибка валидации', HttpStatus.BAD_REQUEST, [
                {
                    property: 'timeEnd',
                    message: 'Время записи не может быть больше, чем конец вашего рабочего дня'
                }
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
                {
                    property: 'timeStart',
                    message: 'Это время уже занято или произошло наложение записей'
                },
                {
                    property: 'timeEnd',
                    message: 'Это время уже занято или произошло наложение записей'
                }
            ]);
        }
    }

    private async getUserWorkdaySettings(userId: number, date: string) {
        const userSettings = await this.settingsService.findOne(userId);
        const startOfDay = this.createScheduleDate(date, userSettings.workdayStartTime);
        const endOfDay = this.createScheduleDate(date, userSettings.workdayEndTime);

        return {startOfDay, endOfDay};
    }

    private checkSlotOccupancy(
        schedules: Partial<ScheduleModel[]>,
        scheduleDto: CreateScheduleDto
    ): boolean {
        return schedules.some((schedule) => {
            return (
                (scheduleDto.timeStart >= schedule.timeStart &&
                    scheduleDto.timeStart < schedule.timeEnd) ||
                (scheduleDto.timeEnd > schedule.timeStart &&
                    scheduleDto.timeEnd <= schedule.timeEnd) ||
                (scheduleDto.timeStart <= schedule.timeStart &&
                    scheduleDto.timeEnd >= schedule.timeEnd)
            );
        });
    }

    private async validateProducts(
        scheduleDto: CreateScheduleDto,
        userId: number
    ): Promise<ProductModel[]> {
        const productIds = scheduleDto.products.map((product) => product.id);
        const products: ProductModel[] = await this.productsService.findAllByIds(
            productIds,
            userId
        );

        if (!products.length) {
            throw new ApiException('Ошибка валидации', HttpStatus.BAD_REQUEST, [
                {property: 'products', message: 'Указанные услуги не были найдены'}
            ]);
        }

        return products;
    }

    private async createTransaction(
        userId: number,
        scheduleDto: CreateScheduleDto,
        products: ProductModel[]
    ): Promise<ScheduleModel> {
        const preparedScheduleData = this.prepareCreateScheduleData(userId, scheduleDto);

        let schedule: ScheduleModel | null = null;

        return await this.scheduleRepository.sequelize
            .transaction(async (transaction) => {
                schedule = await this.scheduleRepository.create(preparedScheduleData, {
                    transaction
                });

                for (const product of products) {
                    const productPrice = product.price;
                    const productQuantity: number = scheduleDto.products.find(
                        (p) => p.id === product.id
                    ).quantity;

                    await schedule.$add('products', product, {
                        through: {
                            quantity: productQuantity,
                            priceAtSale: productPrice
                        },
                        transaction
                    });
                }
            })
            .then(() => {
                return schedule;
            })
            .catch((e) => {
                throw new ApiException(
                    'В процессе создания записи произошла ошибка',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            });
    }

    private prepareCreateScheduleData(userId: number, scheduleDto: CreateScheduleDto) {
        return {
            userId,
            customerId: scheduleDto.customerId,
            date: scheduleDto.date,
            timeStart: scheduleDto.timeStart,
            timeEnd: scheduleDto.timeEnd
        };
    }

    async update(id: number, userId: number, scheduleDto: CreateScheduleDto): Promise<any> {
        const schedule = await this.findOne(id, userId);

        await this.validateCustomer(scheduleDto.customerId, userId);

        await this.validateTimeSlot(userId, scheduleDto, id);

        const products = await this.validateProducts(scheduleDto, userId);

        const {id: scheduleId} = await this.updateTransaction(schedule, scheduleDto, products);

        return this.findOne(scheduleId, userId);
    }

    private async updateTransaction(
        schedule: ScheduleModel,
        scheduleDto: CreateScheduleDto,
        products: ProductModel[]
    ): Promise<any> {
        const preparedScheduleData = this.prepareUpdateScheduleData(scheduleDto);

        await this.scheduleRepository.sequelize
            .transaction(async (transaction) => {
                await schedule.update(preparedScheduleData, {transaction});

                await schedule.$remove<ProductModel>('products', schedule.products);

                for (const product of products) {
                    const productPrice: number = product.price;
                    const productQuantity: number = scheduleDto.products.find(
                        (p) => p.id === product.id
                    ).quantity;

                    await schedule.$add<ProductModel>('products', product, {
                        through: {
                            quantity: productQuantity,
                            priceAtSale: productPrice
                        },
                        transaction
                    });
                }
            })
            .then(async () => {
                await schedule.reload({
                    include: {
                        model: ProductModel,
                        through: {
                            attributes: ['priceAtSale', 'quantity'],
                            as: 'additional'
                        }
                    }
                });
            })
            .catch((e) => {
                throw new ApiException(
                    'В процессе обновления записи произошла ошибка',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            });

        return schedule;
    }

    private prepareUpdateScheduleData(scheduleDto: CreateScheduleDto) {
        const {products, ...rest} = scheduleDto;
        return rest;
    }

    async cancel(id: number, userId: number) {
        const schedule = await this.findOne(id, userId);

        try {
            await schedule.update({status: ScheduleStatus.CANCELED});
            return schedule;
        } catch (e) {
            throw new ApiException(
                'Не удалось отменить расписание',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async compete(id: number, userId: number) {
        const schedule = await this.findOne(id, userId);

        try {
            await schedule.update({status: ScheduleStatus.SUCCESS});
            return schedule;
        } catch (e) {
            throw new ApiException(
                'Не удалось завершить расписание',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async delete(id: number, userId: number): Promise<{ deletedCount: number }> {
        const schedule = await this.findOne(id, userId);

        try {
            await schedule.destroy();
            return {deletedCount: 1};
        } catch (e) {
            throw new ApiException(
                'Не удалось удалить расписание',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findSchedulesForPeriod(userId: number, startOfDate: Date, endOfDate: Date) {
        return await this.scheduleRepository.findAll({
            where: {
                userId,
                status: ScheduleStatus.SUCCESS,
                createdAt: {
                    [Op.gte]: startOfDate,
                    [Op.lt]: endOfDate
                }
            },
            include: this.includeOptions,
            order: [['createdAt', 'DESC']]
        });
    }

    async getPopularAndProfitableProducts(userId: number) {
        const completedSchedules = await this.findAllByStatus(userId, ScheduleStatus.SUCCESS);

        const completedSchedulesThisMonth = completedSchedules.filter((schedule) => isCurrentMonth(schedule.createdAt));

        const productStatistics = completedSchedulesThisMonth.reduce((stats, schedule) => {
            schedule.products.forEach(product => {
                const productData = stats[product.name] || { income: 0, count: 0 };
                productData.income += product.details.priceAtSale * product.details.quantity;
                productData.count++;
                stats[product.name] = productData;
            });

            return stats;
        }, {});

        const { mostPopularProduct, mostProfitableProduct } = Object.keys(productStatistics).reduce(
            (result, productName) => {
                const { income, count } = productStatistics[productName];
                if (count > result.maxCount) {
                    result.mostPopularProduct = productName;
                    result.maxCount = count;
                }
                if (income > result.maxIncome) {
                    result.mostProfitableProduct = productName;
                    result.maxIncome = income;
                }
                return result;
            },
            { mostPopularProduct: '', mostProfitableProduct: '', maxCount: 0, maxIncome: 0 }
        );

        return {
            popularProduct: {
                name: mostPopularProduct || 'Данных пока нет',
                income: mostPopularProduct.length ? productStatistics[mostPopularProduct].income : 0,
                count: mostPopularProduct.length ? productStatistics[mostPopularProduct].count : 0
            },
            profitableProduct: {
                name: mostProfitableProduct || 'Данных пока нет',
                income: mostProfitableProduct.length ? productStatistics[mostProfitableProduct].income : 0,
                count: mostProfitableProduct.length ? productStatistics[mostProfitableProduct].count : 0
            },
        }
    }

    async getVisits(userId: number) {
        const schedules = await this.findAllByStatus(userId, ScheduleStatus.SUCCESS);

        const filteredSchedulesByCurrentMonth = schedules.filter((schedule) => isCurrentMonth(schedule.createdAt));

        return {
            newTotalCount: filteredSchedulesByCurrentMonth.length,
            totalCount: schedules.length
        }
    }

    async getActiveCustomer(userId: number, date: Date) {
        const activeCustomerStatistics: Record<string, { customer: CustomerModel; visits: number }> = {};
        const schedules: ScheduleModel[] = await this.findAllByStatus(userId, ScheduleStatus.SUCCESS);

        schedules.forEach(schedule => {
            if (isCurrentMonth(schedule.createdAt)) {
                const stats = activeCustomerStatistics[schedule.customerId] || { customer: schedule.customer, visits: 0 };
                stats.visits++;
                activeCustomerStatistics[schedule.customerId] = stats;
            }
        });

        const { mostActiveCustomer, maxVisits } = Object.keys(activeCustomerStatistics).reduce(
            (result, customerId) => {
                const visits = activeCustomerStatistics[customerId].visits;
                if (visits > result.maxVisits) {
                    return { mostActiveCustomer: customerId, maxVisits: visits };
                }
                return result;
            },
            { mostActiveCustomer: '', maxVisits: 0 }
        );

        const activeCustomer = maxVisits > 1 ? activeCustomerStatistics[mostActiveCustomer] : null

        return activeCustomer;
    }

    async getUnreliableCustomers(userId: number) {
        const schedules: ScheduleModel[] = await this.findAllByStatus(userId, ScheduleStatus.CANCELED);

        const tmp = schedules.reduce((acc, schedule) => {
            const customer = schedule.customer;

            if (!acc[customer.id]) {
                acc[customer.id] = {
                    customer,
                    totalCanceled: 0
                };
            }

            acc[customer.id].totalCanceled += 1;

            return acc;
        }, {} as { [key: number]: { customer: CustomerModel; totalCanceled: number } });

        return Object.values(tmp);
    }

    async getAllRevenueDataByCustomers(userId: number) {
        const schedules: ScheduleModel[] = await this.findAllByStatus(userId, ScheduleStatus.SUCCESS);

        const filteredSchedulesByMonth = schedules.filter((schedule) => isCurrentMonth(schedule.createdAt));

        let totalRevenue = 0;

        const customersData = filteredSchedulesByMonth.reduce((acc, schedule) => {
            const customer = schedule.customer;
            const customerRevenue = schedule.products.reduce((sum, product) =>
                sum + product.details.priceAtSale * product.details.quantity, 0);

            totalRevenue += customerRevenue;

            const customerData = acc.find(item => item.customer.id === customer.id);

            if (customerData) {
                customerData.totalRevenue += customerRevenue;
            } else {
                acc.push({
                    customer,
                    totalRevenue: customerRevenue
                });
            }

            return acc;
        }, [] as { customer: CustomerModel; totalRevenue: number }[]);

        const customersWithPercentages = customersData.map(customer => ({
            customer: customer.customer,
            totalRevenue: customer.totalRevenue,
            totalRevenuePercent: totalRevenue > 0 ? parseFloat(((customer.totalRevenue / totalRevenue) * 100).toFixed(2)) : 0
        }));

        return {
            customers: customersWithPercentages,
            totalRevenue: parseFloat(totalRevenue.toFixed(2))
        };
    }

    async getAllRevenueDataByProducts(userId: number) {
        const schedules: ScheduleModel[] = await this.findAllByStatus(userId, ScheduleStatus.SUCCESS);

        const filteredSchedulesByMonth = schedules.filter(schedule => isCurrentMonth(schedule.createdAt));

        let totalRevenue = 0;

        const productsData = filteredSchedulesByMonth.reduce((acc, schedule) => {
            schedule.products.forEach(product => {
                const productId = product.id;
                const revenue = product.details.priceAtSale * product.details.quantity;

                totalRevenue += revenue;

                if (acc[productId]) {
                    acc[productId].totalRevenue += revenue;
                } else {
                    acc[productId] = {
                        product,
                        totalRevenue: revenue
                    };
                }
            });

            return acc;
        }, {} as { [productId: number]: { product: ProductModel; totalRevenue: number } });

        const productsWithPercentages = Object.values(productsData).map(productData => ({
            product: productData.product,
            totalRevenue: productData.totalRevenue,
            totalRevenuePercent: totalRevenue > 0 ? parseFloat(((productData.totalRevenue / totalRevenue) * 100).toFixed(2)) : 0
        }));

        return {
            products: productsWithPercentages.filter((product) => product.totalRevenue > 0).sort((a, b) => b.totalRevenue - a.totalRevenue),
            totalRevenue
        };
    }

    async getServicesCountPerDay(userId: number) {
        const schedules: ScheduleModel[] = await this.findAllByStatus(userId, ScheduleStatus.SUCCESS);

        const filteredSchedulesByMonth = schedules.filter(schedule => isCurrentMonth(schedule.createdAt));

        const currentDate = new Date();

        const servicesCountPerDay: { [day: number]: number } = {};

        for (let day = 1; day <= currentDate.getDate(); day++) {
            servicesCountPerDay[day] = 0;
        }

        filteredSchedulesByMonth.forEach(schedule => {
            const dayOfMonth = new Date(schedule.createdAt).getDate();
            if (dayOfMonth in servicesCountPerDay) {
                servicesCountPerDay[dayOfMonth] += 1;
            }
        });

        return Object.keys(servicesCountPerDay).map(day => ({
            day: Number(day),
            count: servicesCountPerDay[Number(day)]
        }));
    }

    async getAllRevenue(userId: number) {
        const schedules: ScheduleModel[] = await this.findAllByStatus(userId, ScheduleStatus.SUCCESS);

        const filteredSchedulesByMonth = schedules.filter((schedule) => isCurrentMonth(schedule.createdAt));

        return {
            newTotalRevenue: Number(this.getRevenue(filteredSchedulesByMonth).toFixed(2)),
            totalRevenue: Number(this.getRevenue(schedules).toFixed(2))
        };
    }

    private getRevenue(schedules: ScheduleModel[]): number {
        if (schedules.length === 0) return 0;

        return schedules.reduce((acc, schedule) => {
            const scheduleRevenue = schedule.products.reduce((sum, product) => {
                return sum + product.details.priceAtSale * product.details.quantity;
            }, 0);
            return acc + scheduleRevenue;
        }, 0);
    }

    async getTotalCountSchedules(userId: number) {
        const { rows: schedules, count } = await this.findAllAndCount(userId);

        const filteredSchedulesByMonth = schedules.filter((schedule) => isCurrentMonth(schedule.createdAt));

        return {
            newTotalCount: filteredSchedulesByMonth.length,
            totalCount: count
        }
    }

    async getTodaySchedules(userId: number): Promise<ScheduleModel[]> {
        const currentDate = new Date();
        const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
        const endOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);

        return await this.scheduleRepository.findAll({
            where: {
                userId,
                status: ScheduleStatus.PROCESS,
                date: {
                    [Op.between]: [startOfToday, endOfToday]
                }
            },
            include: this.includeOptions
        })
    }

    async getDailyRevenue(userId: number): Promise<{ day: number, revenue: number }[]> {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        const schedules = await this.scheduleRepository.findAll({
            where: {
                userId: userId,
                date: {
                    [Op.between]: [startOfMonth, currentDate],
                },
                status: ScheduleStatus.SUCCESS,
            },
            include: this.includeOptions
        });

        const dailyRevenue: { [day: number]: number } = {};

        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            if (i <= currentDate.getDate()) {
                dailyRevenue[i] = 0;
            }
        }

        schedules.forEach(schedule => {
            const dayOfMonth = new Date(schedule.createdAt).getDate();
            let revenueForDay = 0;

            schedule.products.forEach(product => {
                revenueForDay += product.details.priceAtSale * product.details.quantity;
            });

            dailyRevenue[dayOfMonth] += revenueForDay;
        });

        return Object.keys(dailyRevenue).map(day => ({
            day: Number(day),
            revenue: Number(dailyRevenue[Number(day)].toFixed(2)),
        }));
    }

    async getTotalCountSchedulesByStatuses(userId: number) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const startOfToday = new Date(year, month, 1, 0, 0, 0);
        const endOfToday = new Date(year, month + 1 , 0, 23, 59, 59);

        let successCount = 0;
        let processedCount = 0;
        let canceledCount = 0;

        const schedules = await this.scheduleRepository.findAll({
            where: {
                userId: userId,
                createdAt: {
                    [Op.between]: [startOfToday, endOfToday],
                }
            },
            include: this.includeOptions
        });

        schedules.forEach((schedule) => {
           switch (schedule.status) {
               case ScheduleStatus.SUCCESS:
                   successCount++;
                   break;
               case ScheduleStatus.PROCESS:
                   processedCount++;
                   break;
               case ScheduleStatus.CANCELED:
                   canceledCount++;
                   break;
           }
        });

        return {
            successCount,
            processedCount,
            canceledCount
        };
    }

    async getStatisticsByProcessedSchedules(userId: number) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const startOfToday = new Date(year, month, 1, 0, 0, 0);
        const endOfToday = new Date(year, month + 1 , 0, 23, 59, 59);

        const schedules = await this.scheduleRepository.findAll({
            where: {
                userId: userId,
                createdAt: {
                    [Op.between]: [startOfToday, endOfToday],
                },
                status: ScheduleStatus.PROCESS
            },
            order: [['date', 'ASC'], ['timeStart', 'ASC']],
        });

        const nearestSchedule = schedules[0] || null;

        const schedulesToday = await this.scheduleRepository.findAll({
            where: {
                userId,
                status: [ScheduleStatus.PROCESS, ScheduleStatus.SUCCESS],
                date: {
                    [Op.eq]: currentDate
                }
            }
        });

        const completedSchedulesToday = schedulesToday.reduce((acc, schedule) => schedule.status === ScheduleStatus.SUCCESS ? acc + 1 : acc, 0);

        const weekDays = getWeekDays(new Date());

        const schedulesOnWeek = await this.scheduleRepository.findAll({
            where: {
                userId,
                status: [ScheduleStatus.PROCESS, ScheduleStatus.SUCCESS],
                date: {
                    [Op.between]: [weekDays[0], weekDays[weekDays.length - 1]],
                }
            },
        });

        const completedSchedulesOnWeek = schedulesOnWeek.reduce((acc, schedule) => schedule.status === ScheduleStatus.SUCCESS ? acc + 1 : acc, 0);

        return {
            nearestSchedule,
            totalCountToday: {
                completedTotalCount: completedSchedulesToday,
                totalCount: schedulesToday.length
            },
            totalCountWeek: {
                completedTotalCount: completedSchedulesOnWeek,
                totalCount: schedulesOnWeek.length
            }
        };
    }

    async getAvgBill(userId: number) {
        const schedules = await this.findAllByStatus(userId, ScheduleStatus.SUCCESS);

        const filteredSchedulesByMonth = schedules.filter((schedule) => isCurrentMonth(schedule.createdAt));

        return {
            newTotalAvg: this.calculateAvgBySchedules(filteredSchedulesByMonth),
            totalAvg: this.calculateAvgBySchedules(schedules)
        }
    }

    calculateAvgBySchedules(schedules: ScheduleModel[]): number {
        const totalRevenue = this.getRevenue(schedules);

        const averageCheck = (totalRevenue / schedules.length).toFixed(2);

        return parseFloat(averageCheck);
    }

    async getTotalCountSuccessSchedules(userId: number) {
        const schedules = await this.findAllByStatus(userId, ScheduleStatus.SUCCESS);

        const filteredSchedulesByMonth = schedules.filter((schedule) => isCurrentMonth(schedule.createdAt));

        return {
            newTotalCount: filteredSchedulesByMonth.length,
            totalCount: schedules.length
        }
    }

    async getTotalCountCanceledSchedules(userId: number) {
        const schedules = await this.findAllByStatus(userId, ScheduleStatus.CANCELED);

        const filteredSchedulesByMonth = schedules.filter((schedule) => isCurrentMonth(schedule.createdAt));

        return {
            newTotalCount: filteredSchedulesByMonth.length,
            totalCount: schedules.length
        }
    }

    async getLostRevenue(userId: number) {
        const schedules = await this.findAllByStatus(userId, ScheduleStatus.CANCELED);

        const filteredSchedulesByMonth = schedules.filter((schedule) => isCurrentMonth(schedule.createdAt));

        return {
            newTotalLostRevenue: this.getRevenue(filteredSchedulesByMonth),
            totalLostRevenue: this.getRevenue(schedules)
        }
    }

    async getPercentageCanceledSchedules(userId: number) {
        const successSchedules = await this.findAllByStatus(userId, ScheduleStatus.SUCCESS);
        const canceledSchedules = await this.findAllByStatus(userId, ScheduleStatus.CANCELED);

        const filteredSuccessSchedulesByMonth = successSchedules.filter((schedule) => isCurrentMonth(schedule.createdAt));
        const filteredCanceledSchedulesByMonth = canceledSchedules.filter((schedule) => isCurrentMonth(schedule.createdAt));

        const percentageCanceledAllTime = (canceledSchedules.length / successSchedules.length) * 100;
        const percentageCanceledThisMonth = (filteredCanceledSchedulesByMonth.length / filteredSuccessSchedulesByMonth.length) * 100;

        return {
            allTime: parseFloat(percentageCanceledAllTime.toFixed(2)),
            currentMonth: parseFloat(percentageCanceledThisMonth.toFixed(2))
        }
    }
}
