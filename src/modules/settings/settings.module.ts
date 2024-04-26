import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { SettingsModel } from '@modules/settings/models/settings.model';

@Module({
	imports: [SequelizeModule.forFeature([SettingsModel])],
	controllers: [SettingsController],
	providers: [SettingsService],
	exports: [SettingsService]
})
export class SettingsModule {}
