import {IsMobilePhone, IsNotEmpty, IsOptional, IsString, MinLength} from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {
    @ApiProperty({ example: 'Валерий', description: 'Имя' })
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsOptional()
    firstName?: string;

    @ApiProperty({ example: 'Щербинин', description: 'Фамилия' })
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsOptional()
    lastName?: string;

    @ApiProperty({ example: 'Евгеньевич', description: 'Отчество' })
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsOptional()
    fatherName?: string;

    // @ApiProperty({ example: '89026350106', description: 'mobilePhone' })
    // @IsMobilePhone("ru-RU", {}, { message: VALIDATION_ERROR.IS_MOBILE_PHONE })
    // @IsString({ message: VALIDATION_ERROR.IS_STRING })
    // @IsOptional()
    // mobilePhone?: string;
}