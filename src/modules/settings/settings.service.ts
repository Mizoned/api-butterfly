import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SettingsModel } from '@modules/settings/models/settings.model';
import { Transaction } from 'sequelize';
import { UpdateWorkspaceDto } from '@modules/users/dto/update-workspace.dto';

@Injectable()
export class SettingsService {
	constructor(
		@InjectModel(SettingsModel) private readonly serviceRepository: typeof SettingsModel
	) {}

	async findOne(userId: number): Promise<SettingsModel> {
		return await this.serviceRepository.findOne({
			where: { userId }
		});
	}

	async firstCreate(userId: number, transaction: Transaction): Promise<SettingsModel> {
		return await this.serviceRepository.create(
			{
				userId
			},
			{ transaction }
		);
	}

	async update(userId: number, workspace: UpdateWorkspaceDto): Promise<SettingsModel> {
		const settings = await this.serviceRepository.findOne({ where: { userId } });

		return await settings.update({ ...workspace });
	}
}
