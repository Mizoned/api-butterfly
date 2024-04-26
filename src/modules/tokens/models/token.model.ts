import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { DataTypes } from 'sequelize';
import { UserModel } from '@modules/users/models/user.model';

interface TokenCreationAttrs {
	token: string;
	userId: number;
}

@Table({ tableName: 'tokens' })
export class TokenModel extends Model<TokenModel, TokenCreationAttrs> {
	@ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
	@Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
	id: number;

	@ApiProperty({
		example:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAbWFpbC5ydSIsImlkIjo0LCJmaW8iOiLQqdC10YDQsdC40L3QuNC9INCS0LDQu9C10YDQuNC5INCV0LLQs9C10L3RjNC10LLQuNGHIiwiaWF0IjoxNzA0OTk3NzgwLCJleHAiOjE3MDUwODQxODB9.0PdXXVagiCKSPc121I-idCN61jX3k2aELeYqWb7l-yA',
		description: 'Токен'
	})
	@Column({ type: DataTypes.TEXT, allowNull: false })
	token: string;

	@ApiProperty({ example: 1, description: 'ID пользователя' })
	@ForeignKey(() => UserModel)
	@Column
	userId: number;

	@BelongsTo(() => UserModel)
	user: UserModel;
}
