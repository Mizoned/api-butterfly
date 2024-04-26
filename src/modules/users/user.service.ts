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

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly usersRepository: typeof UserModel,
		private readonly settingsService: SettingsService
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
}
