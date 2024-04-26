import { Body, Controller, Get, Put } from '@nestjs/common';
import { UserService } from '@modules/users/user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';
import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import { UpdatePasswordDto } from '@modules/users/dto/update-password.dto';
import { UpdateWorkspaceDto } from '@modules/users/dto/update-workspace.dto';

@ApiTags('Пользователь')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({ summary: 'Получение данных о пользователе' })
	@Get('/profile/me')
	async me(@CurrentUser() user: IJwtPayload) {
		return await this.userService.me(user.id);
	}

	@ApiOperation({ summary: 'Обновление данных пользователя' })
	@Put('/profile')
	async update(@CurrentUser() user: IJwtPayload, @Body() userDto: UpdateUserDto) {
		return await this.userService.update(user.id, userDto);
	}

	@ApiOperation({ summary: 'Обновление пароля пользователя' })
	@Put('/profile/password')
	async updatePassword(@CurrentUser() user: IJwtPayload, @Body() passwordDto: UpdatePasswordDto) {
		return await this.userService.updatePassword(user.id, passwordDto);
	}

	@ApiOperation({ summary: 'Обновление рабочей зоны пользователя' })
	@Put('/profile/workspace')
	async updateWorkspace(
		@CurrentUser() user: IJwtPayload,
		@Body() workspaceDto: UpdateWorkspaceDto
	) {
		return await this.userService.updateWorkspace(user.id, workspaceDto);
	}
}
