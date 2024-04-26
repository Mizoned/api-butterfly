import { UserModel } from '@modules/users/models/user.model';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';
import { SettingsDto } from "@modules/settings/dto/settings.dto";

export class JwtPayloadDto implements IJwtPayload {
    id: number;
    firstName?: string;
    lastName?: string;
    fatherName?: string;
    email: string;
    mobilePhone?: string;
    settings: SettingsDto;

    public static getObjectByUserModel(user: UserModel): IJwtPayload {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            fatherName: user.fatherName,
            email: user.email,
            mobilePhone: user.mobilePhone,
            settings: {
                workdayStartTime: user.settings.workdayStartTime,
                workdayEndTime: user.settings.workdayEndTime,
            }
        }
    }
}