import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { UserModel } from '@modules/users/models/user.model';
import { CustomerModel } from '@modules/customers/models/customer.model';

interface ScheduleCreationAttrs {
    userId: number;
    customerId: number;
    date: Date;
    timeStart: Date;
    timeEnd: Date;
}

@Table({ tableName: 'schedule' })
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
}