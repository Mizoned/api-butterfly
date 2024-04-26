import { Table, Column, Model, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { UserModel } from '@modules/users/models/user.model';
import { ScheduleModel } from '@modules/schedules/models/schedule.model';

interface CustomerCreationAttrs {
	firstName: string;
	lastName: string;
	fatherName: string;
	mobilePhone: string;
	email: string;
	userId: number;
}

@Table({ tableName: 'customers' })
export class CustomerModel extends Model<CustomerModel, CustomerCreationAttrs> {
	@Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
	id: number;

	@Column({ type: DataTypes.STRING, allowNull: false })
	firstName: string;

	@Column({ type: DataTypes.STRING })
	lastName: string;

	@Column({ type: DataTypes.STRING })
	fatherName: string;

	@Column({ type: DataTypes.STRING, allowNull: false })
	mobilePhone: string;

	@Column({ type: DataTypes.STRING })
	email: string;

	@ForeignKey(() => UserModel)
	@Column({ type: DataTypes.INTEGER, allowNull: false })
	userId: number;

	@BelongsTo(() => UserModel, 'userId')
	user: UserModel;

	@HasMany(() => ScheduleModel, 'customerId')
	schedule: ScheduleModel[];
}
