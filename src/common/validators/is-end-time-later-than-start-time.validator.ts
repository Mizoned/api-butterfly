import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsEndTimeLaterThanStartTime(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'isEndTimeLaterThanStartTime',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const timeStart = args.object['timeStart'];
                    return timeStart && value && timeStart < value;
                },
                defaultMessage(args: ValidationArguments) {
                    const startTimePropertyName = args.constraints[0];
                    return `${args.property} должно быть позже, чем ${startTimePropertyName}`;
                }
            }
        });
    };
}