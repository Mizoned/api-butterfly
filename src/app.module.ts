import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from "@nestjs/sequelize";

import mainConfig from './core/config/main.config';
import { CustomersModule } from "./modules/customers/customers.module";
import {ProductsModule} from "./modules/products/products.module";

@Module({
  imports: [
      ConfigModule.forRoot({
          load: [mainConfig],
          envFilePath: ['.env'],
          isGlobal: true
      }),
      SequelizeModule.forRoot({
          username: process.env.DATABASE_USERNAME,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
          dialect: 'postgres',
          autoLoadModels: true,
          synchronize: true
      }),
      CustomersModule,
      ProductsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
