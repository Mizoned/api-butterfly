import { PipeTransform, Injectable, ArgumentMetadata, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiException } from '@common/exceptions/api.exception';

@Injectable()
export class ApiValidationPipe implements PipeTransform<any> {
	async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
		if (!metatype || !this.toValidate(metatype)) {
			return value;
		}

		const obj = plainToInstance(metatype, value, {});

		const validatedErrors = await validate(obj);

		if (validatedErrors.length) {
			let errors = validatedErrors.map((error) => ({
				property: error.property,
				message: error.constraints[Object.keys(error.constraints)[0]]
			}));

			throw new ApiException('Ошибка валидации полей', HttpStatus.BAD_REQUEST, errors);
		}

		return value;
	}

	private toValidate(metatype: Function): boolean {
		const types: Function[] = [String, Boolean, Number, Array, Object];
		return !types.includes(metatype);
	}
}
