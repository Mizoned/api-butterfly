import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

function isTime(value: string): boolean {
    const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(value);
}

export function IsTime(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'isTime',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return typeof value === 'string' && isTime(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} должно быть временем в формате HH:mm`;
                }
            }
        });
    };
}