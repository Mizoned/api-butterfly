import { Controller } from '@nestjs/common';
import { SettingsService } from "@modules/settings/settings.service";

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}
}
