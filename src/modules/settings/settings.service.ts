import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SettingsModel } from '@modules/settings/models/settings.model';

@Injectable()
export class SettingsService {
    constructor(@InjectModel(SettingsModel) private readonly serviceRepository: typeof SettingsModel) {}

    async findOne(userId: number): Promise<SettingsModel> {
        return await this.serviceRepository.findOne({
            where: { userId }
        });
    }
}
