import { Module } from '@nestjs/common';
import { UsersModule } from '@modules/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokensModule } from '@modules/tokens/tokens.module';
import { AccessTokenStrategy } from '@modules/auth/strategies/accessToken.strategy';

@Module({
	imports: [UsersModule, TokensModule],
	providers: [AuthService, AccessTokenStrategy],
	controllers: [AuthController]
})
export class AuthModule {}
