import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import mainConfig from '@common/config/main.config';
import { CustomersModule } from '@modules/customers/customers.module';
import { ProductsModule } from '@modules/products/products.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
      ConfigModule.forRoot({
          load: [mainConfig],
          envFilePath: ['.env'],
          isGlobal: true
      }),
      SequelizeModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
              username: configService.get('DATABASE_USERNAME'),
              password: configService.get('DATABASE_PASSWORD'),
              database: configService.get('DATABASE_NAME'),
              host: configService.get('DATABASE_HOST'),
              port: parseInt(configService.get('DATABASE_PORT'), 10) || 5432,
              dialect: configService.get('DATABASE_DIALECT') || 'postgres',
              autoLoadModels: true,
              synchronize: true
          }),
          inject: [ConfigService]
      }),
      CustomersModule,
      ProductsModule,
      UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
