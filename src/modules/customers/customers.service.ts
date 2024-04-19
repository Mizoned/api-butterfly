import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CustomerModel } from './models/customer.model';
import { CreateCustomerDto } from '@modules/customers/dto/create-customer.dto';
import { UpdateCustomerDto } from '@modules/customers/dto/update-customer.dto';
import { ApiException } from '@common/exceptions/api.exception';

@Injectable()
export class CustomersService {
    constructor(@InjectModel(CustomerModel) private readonly customersRepository: typeof CustomerModel) {}

    async findAll(userId: number): Promise<CustomerModel[]> {
        return this.customersRepository.findAll({
            where: { userId }
        });
    }

    async findOne(id: number, userId: number): Promise<CustomerModel> {
        const customer = await this.customersRepository.findOne({
            where: { id, userId }
        });

        if (!customer) {
            throw new ApiException('Клиент не найден', HttpStatus.NOT_FOUND);
        }

        if (customer.userId !== userId) {
            throw new ApiException('У вас нет прав на просмотр клиента', HttpStatus.FORBIDDEN);
        }

        return customer;
    }

    async create(userId: number, customerDto: CreateCustomerDto): Promise<CustomerModel> {
        const candidateCustomer = await this.customersRepository.findOne({ where: { mobilePhone: customerDto.mobilePhone, userId } });

        if (candidateCustomer) {
            throw new ApiException('Ошибка валидации', HttpStatus.BAD_REQUEST, [
                {
                    property: 'mobilePhone',
                    message: 'Номер телефона принаджелит другому клиенту'
                }
            ]);
        }

        try {
            return await this.customersRepository.create({ ...customerDto, userId });
        } catch (e) {
            throw new ApiException('Не удалось создать клиента', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(id: number, userId: number, customerDto: UpdateCustomerDto): Promise<CustomerModel> {
        const customer = await this.customersRepository.findByPk(id);

        if (!customer) {
            throw new ApiException('Клиент не найден', HttpStatus.NOT_FOUND);
        }

        if (customer.userId !== userId) {
            throw new ApiException('У вас нет прав на обновление клиента', HttpStatus.FORBIDDEN);
        }

        try {
            await customer.update(customerDto);
            return customer;
        } catch (e) {
            throw new ApiException('Не удалось обновить данные клиента', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id: number, userId: number): Promise<{ deletedCount: number }> {
        const customer = await this.customersRepository.findByPk(id);

        if (!customer) {
            throw new ApiException('Клиент не найден', HttpStatus.NOT_FOUND);
        }

        if (customer.userId !== userId) {
            throw new ApiException('У вас нет прав на удаление клиента', HttpStatus.FORBIDDEN);
        }

        const deletedCount = await this.customersRepository.destroy({ where: { id } });

        if (deletedCount === 0) {
            throw new ApiException('Не удалось удалить клиента', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return { deletedCount };
    }
}
