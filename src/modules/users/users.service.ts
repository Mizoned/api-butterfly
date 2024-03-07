import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(UserModel) private readonly usersRepository: typeof UserModel) {}

    async findAll() {
        return [];
    }

    async findOne(id: number): Promise<UserModel> {
        return await this.usersRepository.findOne({
            where: { id }
        });
    }

    async findOneByEmail(email: string): Promise<UserModel> {
        return await this.usersRepository.findOne({
            where: { email }
        });
    }

    async create(userDto: CreateUserDto): Promise<UserModel> {
        return await this.usersRepository.create({
            email: userDto.email,
            password: userDto.password
        });
    }

    async update(id: number, userDto: any) {
        return id;
    }

    async delete(id: number) {
        return id;
    }
}
