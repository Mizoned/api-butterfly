import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { TokenModel } from '@modules/tokens/models/token.model';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';
import { UserModel } from '@modules/users/models/user.model';
import { JwtPayloadDto } from '@modules/tokens/dto/jwt-payload.dto';
import { IToken } from '@modules/tokens/interfaces/token.interface';
import { ITokens } from '@modules/tokens/interfaces/tokens.interface';

@Injectable()
export class TokensService {
    constructor(
        @InjectModel(TokenModel) private readonly tokensRepository: typeof TokenModel,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    validateRefreshToken(token: string) {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
                ignoreExpiration: false
            });
        } catch (e) {
            return null;
        }
    }

    async findRefreshToken(token: string): Promise<TokenModel> {
        return await this.tokensRepository.findOne({ where: { token } });
    }

    async findRefreshTokenByUserId(userId: number): Promise<TokenModel> {
        return await this.tokensRepository.findOne({ where: { userId } });
    }

    async delete(token: string): Promise<boolean> {
        const isDeleted: number = await this.tokensRepository.destroy({ where: { token } });

        return !!isDeleted;
    }

    async processGenerateTokens(user: UserModel): Promise<ITokens> {
        const tokenData = await this.findRefreshTokenByUserId(user.id);
        const payload = JwtPayloadDto.getObjectByUserModel(user);
        const { accessToken, refreshToken } = await this.generateTokens(payload);

        try {
            await this.tokensRepository.sequelize.transaction(async (transaction) => {
                if (tokenData) {
                    await tokenData.update({ token: refreshToken.token }, { transaction });
                } else {
                    await this.tokensRepository.create({
                        userId: user.id,
                        token: refreshToken.token
                    }, { transaction });
                }
            });
        } catch (e) {
            throw new InternalServerErrorException('Произошла непредвиденная ошибка');
        }

        return { accessToken, refreshToken };
    }

    async generateTokens(payload: IJwtPayload): Promise<ITokens> {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(payload),
            this.generateRefreshToken(payload)
        ]);

        return { accessToken, refreshToken };
    }

    async generateAccessToken(payload: IJwtPayload): Promise<IToken> {
        const expiration = this.configService.get('JWT_ACCESS_EXPIRATION');
        const date = new Date();
        date.setDate(date.getDate() + parseInt(expiration));

        const token = this.jwtService.sign(
            payload,
            {
                secret: this.configService.get('JWT_ACCESS_SECRET_KEY'),
                expiresIn: expiration
            }
        );

        return { token, exp: date };
    }

    async generateRefreshToken(payload: IJwtPayload): Promise<IToken> {
        const expiration = this.configService.get('JWT_REFRESH_EXPIRATION');
        const date = new Date();
        date.setDate(date.getDate() + parseInt(expiration));

        const token = this.jwtService.sign(
            payload,
            {
                secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
                expiresIn: expiration
            }
        );

        return { token, exp: date };
    }
}
