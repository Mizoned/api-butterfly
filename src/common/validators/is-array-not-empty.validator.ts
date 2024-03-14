import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsArrayNotEmpty(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'isTime',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return Array.isArray(value) && value.length > 0;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} не должно быть пустым`;
                }
            }
        });
    };
}