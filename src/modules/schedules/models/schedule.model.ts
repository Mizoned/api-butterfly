import { Table, Column, Model, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { UserModel } from '@modules/users/models/user.model';
import { CustomerModel } from '@modules/customers/models/customer.model';
import { ProductModel } from '@modules/products/models/product.model';
import { ScheduleProductsModel } from '@modules/schedules/models/schedule-products.model';

interface ScheduleCreationAttrs {
    userId: number;
    customerId: number;
    date: Date;
    timeStart: Date;
    timeEnd: Date;
}

@Table({ tableName: 'schedules' })
export class ScheduleModel extends Model<ScheduleModel, ScheduleCreationAttrs> {
    @Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataTypes.DATE, allowNull: false })
    date: Date;

    @Column({ type: DataTypes.DATE, allowNull: false })
    timeStart: Date;

    @Column({ type: DataTypes.DATE, allowNull: false })
    timeEnd: Date;

    @ForeignKey(() => UserModel)
    @Column({ type: DataTypes.INTEGER, allowNull: false })
    userId: number;

    @BelongsTo(() => UserModel, 'userId')
    user: UserModel;

    @ForeignKey(() => CustomerModel)
    @Column({ type: DataTypes.INTEGER, allowNull: false })
    customerId: number;

    @BelongsTo(() => CustomerModel, 'customerId')
    customer: CustomerModel;

    @BelongsToMany(() => ProductModel, () => ScheduleProductsModel)
    products: ProductModel[];
}