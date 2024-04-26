import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { UserModel } from '@modules/users/models/user.model';
import { TokensService } from '@modules/tokens/tokens.service';
import LoginUserDto from '@modules/auth/dto/login-user.dto';
import RegisterUserDto from '@modules/auth/dto/register-user.dto';
import { ITokens } from '@modules/tokens/interfaces/tokens.interface';
import * as bcrypt from "bcrypt";
import { ApiException } from "@common/exceptions/api.exception";
import {SettingsService} from "@modules/settings/settings.service";
import {ResponseUserDto} from "@modules/users/response/response-user.dto";
import {AuthResponse} from "@modules/auth/response/auth-response.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly tokensService: TokensService
    ) {}

    async signIn(userDto: LoginUserDto): Promise<{ tokens: ITokens, user: ResponseUserDto }> {
        const candidate: UserModel = await this.usersService.findOneByEmail(userDto.email);

        if (!candidate) {
            throw new ApiException('Ошибка авторизации', HttpStatus.BAD_REQUEST, [
                {
                    property: 'email',
                    message: 'Пользователь c таким электронным адресом не зарегистрирован'
                }
            ]);
        }

        const isCompared = await this.comparePassword(userDto.password, candidate.password);

        if (!isCompared) {
            throw new ApiException('Ошибка авторизации', HttpStatus.BAD_REQUEST, [
                {
                    property: 'password',
                    message: 'Неправильный логин или пароль'
                }
            ]);
        }

        const tokens = await this.tokensService.processGenerateTokens(candidate);

        return { tokens, user: ResponseUserDto.createResponseUser(candidate) };
    }

    async signUp(userDto: RegisterUserDto): Promise<{tokens: ITokens, user: ResponseUserDto}> {
        const candidate: UserModel = await this.usersService.findOneByEmail(userDto.email);

        if (candidate) {
            throw new ApiException('Ошибка авторизации', HttpStatus.CONFLICT, [
                {
                    property: 'email',
                    message: 'Пользователь с таким email уже зарегистрирован'
                }
            ]);
        }

        const hashedPassword = await this.hashPassword(userDto.password);

        const newUser = await this.usersService.create({
            ...userDto,
            password: hashedPassword
        });

        if (!newUser) {
            throw new ApiException('Ошибка авторизации', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const tokens = await this.tokensService.processGenerateTokens(newUser);

        return { tokens, user: ResponseUserDto.createResponseUser(newUser) };
    }

    async logout(refreshToken: string): Promise<boolean> {
        return this.tokensService.delete(refreshToken);
    }

    async refresh(refreshToken: string): Promise<AuthResponse> {
        const tokenModel = await this.tokensService.findRefreshToken(refreshToken);

        if (!tokenModel || !tokenModel.token) {
            throw new ApiException('Доступ к ресурсу запрещен', HttpStatus.FORBIDDEN);
        }

        const refreshTokenMatches = await this.tokensService.validateRefreshToken(tokenModel.token);

        if (!refreshTokenMatches) {
            throw new ApiException('Доступ к ресурсу запрещен', HttpStatus.FORBIDDEN);
        }

        const user = await this.usersService.findOne(tokenModel.userId);

        const tokens = await this.tokensService.processGenerateTokens(user);

        return { tokens, user: ResponseUserDto.createResponseUser(user) };
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
