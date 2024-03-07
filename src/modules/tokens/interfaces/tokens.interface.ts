import { IToken } from '@modules/tokens/interfaces/token.interface';

export interface ITokens {
    accessToken: IToken;
    refreshToken: IToken;
}