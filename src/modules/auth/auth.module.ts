import { Module } from '@nestjs/common';
import { UsersModule } from '@modules/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokensModule } from '@modules/tokens/tokens.module';

@Module({
    imports: [
        UsersModule,
        TokensModule
    ],
    providers: [ AuthService ],
    controllers: [ AuthController ]
})
export class AuthModule {
}
