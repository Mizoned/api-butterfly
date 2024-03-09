import { IsDate, IsNotEmpty } from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';

export class UpdateScheduleDto {
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