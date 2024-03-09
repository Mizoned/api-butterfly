import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';

export class UpdateProductDto {
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    public name: string;

    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    @IsNumber({}, { message: VALIDATION_ERROR.IS_PRICE })
    public price: number;
}