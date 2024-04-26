import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { VALIDATION_ERROR } from '@constants/messages/validation';

export class CreateProductDto {
	@ApiProperty({ example: 'Продукт №1', description: 'name' })
	@IsString({ message: VALIDATION_ERROR.IS_STRING })
	@IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
	public name: string;

	@ApiProperty({ example: 120, description: 'price' })
	@IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
	@IsNumber({}, { message: VALIDATION_ERROR.IS_PRICE })
	public price: number;
}
