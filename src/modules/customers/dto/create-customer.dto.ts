import {IsEmail, IsMobilePhone, IsNotEmpty, IsString} from "class-validator";
import {VALIDATION_ERROR} from "@constants/messages/validation";

export class CreateCustomerDto {
    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    firstName: string;

    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    lastName?: string;

    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    fatherName?: string;

    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsEmail({}, { message: VALIDATION_ERROR.IS_EMAIL })
    email?: string;

    @IsString({ message: VALIDATION_ERROR.IS_STRING })
    @IsNotEmpty({ message: VALIDATION_ERROR.IS_NOT_EMPTY })
    @IsMobilePhone("ru-RU", {}, { message: VALIDATION_ERROR.IS_NOT_EMPTY })
    mobilePhone: string;
}