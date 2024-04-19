import { ApiProperty } from '@nestjs/swagger';
import {IsArray, IsDateString, IsNotEmpty, IsNumber, IsString} from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';
import { IsTime, IsArrayNotEmpty, IsEndTimeLaterThanStartTime } from "@common/validators";

export class CreateScheduleDto {
    @ApiProperty({ example: 1, description: 'customerId' })
    @IsNumber({}, { message: VALIDATION_ERROR.IS_NUMBER })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    customerId: number;

    @ApiProperty({ example: '2024-03-13T19:00:00.920Z', description: 'date' })
    @IsDateString({}, { message: VALIDATION_ERROR.IS_DATE })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    date: string;

    @ApiProperty({ example: '15:00', description: 'timeStart' })
    @IsTime({ message: VALIDATION_ERROR.IS_TIME })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    timeStart: string;

    @ApiProperty({ example: '17:00', description: 'timeEnd' })
    @IsEndTimeLaterThanStartTime({ message: 'Время окончания должно быть больше времени начала' })
    @IsTime({ message: VALIDATION_ERROR.IS_TIME })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    timeEnd: string;

    @ApiProperty({ example: [1, 2, 3], description: 'productsId' })
    @IsArrayNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    @IsArray({ message: VALIDATION_ERROR.IS_ARRAY })
    products: Array<{ id: number, quantity: number }>;
}