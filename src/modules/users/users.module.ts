import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from "./users.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserModel } from "./models/user.model";

@Module({
  imports: [ SequelizeModule.forFeature([UserModel]) ],
  providers: [ UsersService ],
  controllers: [ UsersController ],
  exports: []
})
export class UsersModule {}
