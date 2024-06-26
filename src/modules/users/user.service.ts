import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { ApiException } from '@common/exceptions/api.exception';
import { SettingsModel } from '@modules/settings/models/settings.model';
import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import { comparePassword, hashPassword } from '@common/utils';
import { ResponseUserDto } from '@modules/users/response/response-user.dto';
import { UpdatePasswordDto } from '@modules/users/dto/update-password.dto';
import { SettingsService } from '@modules/settings/settings.service';
import { UpdateWorkspaceDto } from '@modules/users/dto/update-workspace.dto';
import { FilesService } from '@modules/files/files.service';
import { FileType } from "@modules/files/types";

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly usersRepository: typeof UserModel,
		private readonly settingsService: SettingsService,
		private readonly filesService: FilesService
	) {}

	async me(id: number): Promise<ResponseUserDto> {
		const user = await this.usersRepository.findByPk(id, {
			include: {
				model: SettingsModel
			}
		});

		if (!user) {
			throw new ApiException('Запрашиваемый пользователь не найден', HttpStatus.NOT_FOUND);
		}

		return ResponseUserDto.createResponseUser(user);
	}

	async update(id: number, userDto: UpdateUserDto): Promise<ResponseUserDto> {
		const user = await this.usersRepository.findOne({
			where: { id },
			include: {
				model: SettingsModel
			}
		});

		await user.update({ ...userDto });

		return ResponseUserDto.createResponseUser(user);
	}

	async updateWorkspace(id: number, workspace: UpdateWorkspaceDto): Promise<ResponseUserDto> {
		const user = await this.usersRepository.findOne({ where: { id } });

		user.dataValues.settings = await this.settingsService.update(id, workspace);

		return ResponseUserDto.createResponseUser(user);
	}

	async updatePassword(
		id: number,
		{ oldPassword, newPassword }: UpdatePasswordDto
	): Promise<ResponseUserDto> {
		const user = await this.usersRepository.findOne({
			where: { id },
			include: {
				model: SettingsModel
			}
		});

		const isCompared = await comparePassword(oldPassword, user.password);

		if (!isCompared) {
			throw new ApiException('Ошибка смены пароля', HttpStatus.BAD_REQUEST, [
				{
					property: 'oldPassword',
					message: 'Пароль введен неверно'
				}
			]);
		}

		const hashedPassword = await hashPassword(newPassword);

		await user.update({
			password: hashedPassword
		});

		return ResponseUserDto.createResponseUser(user);
	}

	async updateAvatar(id: number, file: Express.Multer.File) {
		try {
			const user = await this.usersRepository.findOne({
				where: { id },
				include: {
					model: SettingsModel
				}
			});

			if (user.avatar) {
				await this.filesService.removeFile(user.avatar);
			}

			const fileName = await this.filesService.createFile(FileType.AVATAR, file)

			await user.update({
				avatar: fileName
			});

			return ResponseUserDto.createResponseUser(user);
		} catch (error) {
			throw new ApiException('Не удалось обновить изображение профиля', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async removeAvatar(id: number) {
		try {
			const user = await this.usersRepository.findOne({
				where: { id },
				include: {
					model: SettingsModel
				}
			});

			await this.filesService.removeFile(user.avatar);

			await user.update({
				avatar: ''
			});

			return ResponseUserDto.createResponseUser(user);
		} catch (error) {
			throw new ApiException('Не удалось удалить изображение профиля', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
