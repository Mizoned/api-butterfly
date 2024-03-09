import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';

export class CreateScheduleDto {
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsNumber({}, { message: VALIDATION_ERROR.IS_NUMBER })
    customerId: number;

    @IsDate({ message: VALIDATION_ERROR.IS_DATE })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_PRICE })
    date: Date;

    @IsDate({ message: VALIDATION_ERROR.IS_DATE })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_PRICE })
    timeStart: Date;

    @IsDate({ message: VALIDATION_ERROR.IS_DATE })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_PRICE })
    timeEnd: Date;
}