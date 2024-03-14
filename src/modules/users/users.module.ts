import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { SettingsModel } from '@modules/settings/models/settings.model';
import { SettingsModule } from "@modules/settings/settings.module";

@Module({
  imports: [
      SequelizeModule.forFeature([UserModel, SettingsModel]),
      SettingsModule
  ],
  providers: [ UsersService ],
  controllers: [ UsersController ],
  exports: [ UsersService ]
})
export class UsersModule {}
