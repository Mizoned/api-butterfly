import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { ScheduleModel } from '@modules/schedules/models/schedule.model';
import { ProductModel } from '@modules/products/models/product.model';

interface ScheduleProductsCreationAttrs {
    scheduleId: number;
    productId: number;
    priceAtSale: number;
    quantity: number;
    date: Date;
}

@Table({ tableName: 'scheduleProducts' })
export class ScheduleProductsModel extends Model<ScheduleProductsModel, ScheduleProductsCreationAttrs> {
    @Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataTypes.DATE, allowNull: false })
    date: Date;

    @Column({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 })
    quantity: number;

    @Column({ type: DataTypes.FLOAT, allowNull: false })
    priceAtSale: number;

    @ForeignKey(() => ScheduleModel)
    @Column({ type: DataTypes.INTEGER, allowNull: false })
    scheduleId: number;

    @ForeignKey(() => ProductModel)
    @Column({ type: DataTypes.INTEGER, allowNull: false })
    productId: number;
}