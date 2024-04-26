import { Body, Controller, Get, HttpException, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@modules/auth/auth.service';
import { ITokens } from '@modules/tokens/interfaces/tokens.interface';
import LoginUserDto from '@modules/auth/dto/login-user.dto';
import RegisterUserDto from '@modules/auth/dto/register-user.dto';
import { Cookie } from '@common/decorators/cookies.decorator';
import { Response } from 'express';
import { Public } from '@common/decorators/public.decorator';
import { ResponseUserDto } from '@modules/users/response/response-user.dto';

const REFRESH_TOKEN = 'refreshToken';

@Public()
@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({ summary: 'Авторизация' })
	@ApiResponse({ status: 200 })
	@Post('/sign-in')
	async signIn(@Body() userDto: LoginUserDto, @Res() response: Response) {
		const { tokens, user } = await this.authService.signIn(userDto);

		this.setRefreshTokenToCookies(tokens, user, response);
	}

	private setRefreshTokenToCookies(tokens: ITokens, user: ResponseUserDto, response: Response) {
		if (!tokens) {
			throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
		}

		response.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
			httpOnly: true,
			sameSite: 'lax',
			expires: tokens.refreshToken.exp,
			secure: false,
			path: '/'
		});

		response.status(HttpStatus.OK);
		response.json({ accessToken: tokens.accessToken.token, user });
	}

	@ApiOperation({ summary: 'Регистрация' })
	@ApiResponse({ status: 200 })
	@Post('/sign-up')
	async signUp(@Body() userDto: RegisterUserDto, @Res() response: Response) {
		const { tokens, user } = await this.authService.signUp(userDto);

		this.setRefreshTokenToCookies(tokens, user, response);
	}

	@ApiOperation({ summary: 'Выход из системы' })
	@ApiResponse({ status: 200 })
	@Post('/logout')
	async logout(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() response: Response) {
		if (!refreshToken) {
			response.sendStatus(HttpStatus.OK);
			return;
		}

		const isDeleted = await this.authService.logout(refreshToken);

		if (isDeleted) {
			response.clearCookie(REFRESH_TOKEN);
			response.sendStatus(HttpStatus.OK);
		} else {
			response.sendStatus(HttpStatus.BAD_REQUEST);
		}
	}

	@ApiOperation({ summary: 'Обновление refresh токена' })
	@ApiResponse({ status: 200 })
	@Get('/refresh')
	async refresh(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() response: Response) {
		if (!refreshToken) {
			throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
		}

		const { tokens, user } = await this.authService.refresh(refreshToken);

		this.setRefreshTokenToCookies(tokens, user, response);
	}
}
