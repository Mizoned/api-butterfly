import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomersModule } from '@modules/customers/customers.module';
import { ProductsModule } from '@modules/products/products.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { TokensModule } from '@modules/tokens/tokens.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import mainConfig from '@common/config/main.config';
import { ApiValidationPipe } from '@common/pipes/api-validation.pipe';
import { AllExceptionsFilter } from '@common/filters/api-exception.filter';

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
      UsersModule,
      AuthModule,
      TokensModule
  ],
  controllers: [],
  providers: [
      {
          provide: APP_GUARD,
          useClass: JwtAuthGuard
      },
      {
          provide: APP_PIPE,
          useClass: ApiValidationPipe
      },
      {
          provide: APP_FILTER,
          useClass: AllExceptionsFilter
      }
  ],
})
export class AppModule {}
