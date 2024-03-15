import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SettingsModel } from '@modules/settings/models/settings.model';
import { Transaction } from 'sequelize';

@Injectable()
export class SettingsService {
    constructor(@InjectModel(SettingsModel) private readonly serviceRepository: typeof SettingsModel) {}

    async findOne(userId: number): Promise<SettingsModel> {
        return await this.serviceRepository.findOne({
            where: { userId }
        });
    }

    async firstCreate(userId: number, transaction: Transaction): Promise<SettingsModel> {
        return await this.serviceRepository.create({
            userId
        }, { transaction });
    }
}
