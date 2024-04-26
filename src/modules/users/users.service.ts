import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { SettingsService } from '@modules/settings/settings.service';
import { ApiException } from '@common/exceptions/api.exception';
import { SettingsModel } from '@modules/settings/models/settings.model';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(UserModel) private readonly usersRepository: typeof UserModel,
		private readonly settingsService: SettingsService
	) {}

	async findOne(id: number): Promise<UserModel> {
		return await this.usersRepository.findOne({
			where: { id },
			include: {
				model: SettingsModel
			}
		});
	}

	async findOneByEmail(email: string): Promise<UserModel> {
		return await this.usersRepository.findOne({
			where: { email },
			include: {
				model: SettingsModel
			}
		});
	}

	async create(userDto: CreateUserDto): Promise<UserModel> {
		let user: UserModel | null = null;

		await this.usersRepository.sequelize
			.transaction(async (transaction) => {
				user = await this.usersRepository.create(
					{
						email: userDto.email,
						password: userDto.password
					},
					{ transaction }
				);

				user.settings = await this.settingsService.firstCreate(user.id, transaction);
			})
			.catch(() => {
				throw new ApiException(
					'Произошла ошибка при создании пользователя',
					HttpStatus.INTERNAL_SERVER_ERROR
				);
			});

		return user;
	}
}
