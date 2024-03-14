import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty } from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';

export class UpdateScheduleDto {
    @ApiProperty({ example: '2024-02-10T18:29:40.124Z', description: 'date' })
    @IsDate({ message: VALIDATION_ERROR.IS_DATE })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    date: string;

    @ApiProperty({ example: '2024-02-10T18:29:40.124Z', description: 'timeStart' })
    @IsDate({ message: VALIDATION_ERROR.IS_DATE })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    timeStart: string;

    @ApiProperty({ example: '2024-02-10T18:29:40.124Z', description: 'timeEnd' })
    @IsDate({ message: VALIDATION_ERROR.IS_DATE })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    timeEnd: string;
}