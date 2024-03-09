import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';

export class UpdateExpensesDto {
    @ApiProperty({ example: 'Расход №1', description: 'name' })
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    name: string;

    @ApiProperty({ example: 120, description: 'price' })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    @IsNumber({}, { message: VALIDATION_ERROR.IS_PRICE })
    price: number;

    @ApiProperty({ example: '2024-02-10T18:29:40.124Z', description: 'date' })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    @IsDate({ message: VALIDATION_ERROR.IS_DATE })
    date: Date;
}