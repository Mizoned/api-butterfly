import { Table, Column, Model, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { UserModel } from '@modules/users/models/user.model';
import { CustomerModel } from '@modules/customers/models/customer.model';
import { ProductModel } from '@modules/products/models/product.model';
import { ScheduleProductsModel } from '@modules/schedules/models/schedule-products.model';

interface ScheduleCreationAttrs {
    userId: number;
    customerId: number;
    date: string;
    timeStart: string;
    timeEnd: string;
}

@Table({ tableName: 'schedules' })
export class ScheduleModel extends Model<ScheduleModel, ScheduleCreationAttrs> {
    @Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataTypes.DATEONLY, allowNull: false })
    date: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    timeStart: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    timeEnd: string;

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