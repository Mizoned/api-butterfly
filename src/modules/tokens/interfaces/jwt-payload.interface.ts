import { SettingsDto } from "@modules/settings/dto/settings.dto";

export interface IJwtPayload {
    id: number;
    firstName?: string;
    lastName?: string;
    fatherName?: string;
    email: string;
    mobilePhone?: string;
    settings: SettingsDto;
}