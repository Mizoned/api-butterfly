import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';

@Injectable()
export class UsersService {
    constructor(@InjectModel(UserModel) private readonly usersRepository: typeof UserModel) {}

    async findAll() {
        return [];
    }

    async findOne(id: number) {
        return id;
    }

    async create(userDto: any) {
        return userDto;
    }

    async update(id: number, userDto: any) {
        return id;
    }

    async delete(id: number) {
        return id;
    }
}
