import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';

export default class RegisterUserDto {
    @ApiProperty({ example: 'user@mail.ru', description: 'Email' })
    @IsEmail({}, { message: VALIDATION_ERROR.IS_EMAIL })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    readonly email: string;

    @ApiProperty({ example: '123456789', description: 'Пароль' })
    @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов' })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    readonly password: string;
}