import {
	Body,
	Controller, Delete,
	FileTypeValidator,
	Get, MaxFileSizeValidator,
	ParseFilePipe,
	Post,
	Put,
	UploadedFile,
	UseInterceptors, UsePipes
} from '@nestjs/common';
import { UserService } from '@modules/users/user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IJwtPayload } from '@modules/tokens/interfaces/jwt-payload.interface';
import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import { UpdatePasswordDto } from '@modules/users/dto/update-password.dto';
import { UpdateWorkspaceDto } from '@modules/users/dto/update-workspace.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from '@common/pipes/file-size-validation.pipe';
import { FileTypeValidationPipe } from '@common/pipes/file-type-validation.pipe';

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

	@ApiOperation({ summary: 'Обновление аватара пользователя' })
	@Post('/profile/avatar')
	@UseInterceptors(FileInterceptor('avatar'))
	async updateAvatar(
		@CurrentUser() user: IJwtPayload,
		@UploadedFile(
			new FileTypeValidationPipe(
				'avatar',
				'Неподдерживаемый формат файла. Пожалуйста, загрузите изображение в одном из следующих форматов: JPEG, PNG',
				['image/png', 'image/jpeg']
			),
			new FileSizeValidationPipe(
				'avatar',
				'Размер файла превышает допустимый лимит (2 МБ). Пожалуйста, загрузите изображение меньшего размера.',
				2000000
			)
		) avatar: Express.Multer.File
	) {
		return await this.userService.updateAvatar(user.id, avatar);
	}

	@ApiOperation({ summary: 'Удаление аватара пользователя' })
	@Delete('/profile/avatar')
	async removeAvatar(@CurrentUser() user: IJwtPayload) {
		return await this.userService.removeAvatar(user.id);
	}
}
