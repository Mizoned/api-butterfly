import { ApiProperty } from "@nestjs/swagger";
import { SettingsDto } from "@modules/settings/dto/settings.dto";
import { UserModel } from "@modules/users/models/user.model";

export class ResponseUserDto {
    @ApiProperty({ example: 'user@mail.ru', description: 'Email' })
    email: string;

    @ApiProperty({ example: 'Валерий', description: 'Имя' })
    firstName: string;

    @ApiProperty({ example: 'Щербинин', description: 'Фамилия' })
    lastName: string;

    @ApiProperty({ example: 'Евгеньевич', description: 'Отчество' })
    fatherName: string;

    @ApiProperty({ example: '89026350106', description: 'Телефон' })
    mobilePhone: string;

    @ApiProperty({ example: {}, description: 'Настройки' })
    settings: SettingsDto;

    static createResponseUser(userModel: UserModel): ResponseUserDto {
        const { password, ...user } = userModel.dataValues;

        const settingsData = user.settings.dataValues;

        return {
            ...user,
            settings: {
                workdayStartTime: settingsData.workdayStartTime,
                workdayEndTime: settingsData.workdayEndTime,
            }
        };
    }
}