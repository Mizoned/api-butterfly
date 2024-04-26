import { ResponseUserDto } from '@modules/users/response/response-user.dto';
import { ITokens } from '@modules/tokens/interfaces/tokens.interface';

export interface AuthResponse {
	tokens: ITokens;
	user: ResponseUserDto;
}
