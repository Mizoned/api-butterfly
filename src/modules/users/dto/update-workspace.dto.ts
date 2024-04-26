import {ApiProperty} from "@nestjs/swagger";
import {IsEndTimeLaterThanStartTime, IsTime} from "@common/validators";
import {VALIDATION_ERROR} from "@constants/messages/validation";
import {IsNotEmpty} from "class-validator";

export class UpdateWorkspaceDto {
    @ApiProperty({ example: '15:00', description: 'workdayStartTime' })
    @IsTime({ message: VALIDATION_ERROR.IS_TIME })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    workdayStartTime: string;

    @ApiProperty({ example: '17:00', description: 'workdayEndTime' })
    @IsEndTimeLaterThanStartTime( { message: 'Время окончания должно быть больше времени начала' }, 'workdayStartTime')
    @IsTime({ message: VALIDATION_ERROR.IS_TIME })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    workdayEndTime: string;
}