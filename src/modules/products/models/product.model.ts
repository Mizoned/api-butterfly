import { Table, Column, Model, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { DataTypes } from "sequelize";
import { UserModel } from "@modules/users/models/user.model";
import { ScheduleProductsModel } from '@modules/schedule/models/schedule-products.model';
import { ScheduleModel } from '@modules/schedule/models/schedule.model';

interface ProductCreationAttrs {
    name: string;
    price: number;
    userId: number;
}

@Table({ tableName: 'products' })
export class ProductModel extends Model<ProductModel, ProductCreationAttrs> {
    @Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataTypes.STRING, allowNull: false })
    name: string;

    @Column({ type: DataTypes.FLOAT, allowNull: false })
    price: number;

    @ForeignKey(() => UserModel)
    @Column({ type: DataTypes.INTEGER })
    userId: number;

    @BelongsTo(() => UserModel, 'userId')
    user: UserModel;

    @BelongsToMany(() => ScheduleModel, () => ScheduleProductsModel)
    schedules: ScheduleModel[];
}