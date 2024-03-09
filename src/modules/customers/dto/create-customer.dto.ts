import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';

export class CreateCustomerDto {
    @ApiProperty({ example: 'Валерий', description: 'firstName' })
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    firstName: string;

    @ApiProperty({ example: 'Щербинин', description: 'lastName' })
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    lastName?: string;

    @ApiProperty({ example: 'Евгеньвич', description: 'fatherName' })
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    fatherName?: string;

    @ApiProperty({ example: 'example@mail.ru', description: 'email' })
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsEmail({}, { message: VALIDATION_ERROR.IS_EMAIL })
    email?: string;

    @ApiProperty({ example: '89026350106', description: 'mobilePhone' })
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    @IsMobilePhone("ru-RU", {}, { message: VALIDATION_ERROR.IS_MOBILE_PHONE })
    mobilePhone: string;
}