import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';

export class CreateScheduleDto {
    @ApiProperty({ example: 1, description: 'customerId' })
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsNumber({}, { message: VALIDATION_ERROR.IS_NUMBER })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    customerId: number;

    @ApiProperty({ example: '2024-02-10T18:29:40.124Z', description: 'date' })
    @IsDate({ message: VALIDATION_ERROR.IS_DATE })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    date: Date;

    @ApiProperty({ example: '2024-02-10T18:29:40.124Z', description: 'timeStart' })
    @IsDate({ message: VALIDATION_ERROR.IS_DATE })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    timeStart: Date;

    @ApiProperty({ example: '2024-02-10T18:29:40.124Z', description: 'timeEnd' })
    @IsDate({ message: VALIDATION_ERROR.IS_DATE })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    timeEnd: Date;
}