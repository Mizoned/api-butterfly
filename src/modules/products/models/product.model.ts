import { Table, Column, Model, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { DataTypes, CreationOptional } from 'sequelize';
import { UserModel } from '@modules/users/models/user.model';
import { ScheduleProductsModel } from '@modules/schedules/models/schedule-products.model';
import { ScheduleModel } from '@modules/schedules/models/schedule.model';
import { ProductStatus, ProductCreationAttrs } from '@modules/products/interfaces';

@Table({ tableName: 'products', timestamps: true })
export class ProductModel extends Model<ProductModel, ProductCreationAttrs> {
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	@Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
	id: number;

	@Column({ type: DataTypes.STRING, allowNull: false })
	name: string;

	@Column({ type: DataTypes.FLOAT, allowNull: false })
	price: number;

	@Column({
		type: DataTypes.ENUM(...Object.values(ProductStatus)),
		defaultValue: ProductStatus.ACTIVE
	})
	status: string;

	@ForeignKey(() => UserModel)
	@Column({ type: DataTypes.INTEGER })
	userId: number;

	@BelongsTo(() => UserModel, 'userId')
	user: UserModel;

	@BelongsToMany(() => ScheduleModel, () => ScheduleProductsModel)
	schedules: ScheduleModel[];
}
