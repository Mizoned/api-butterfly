import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from "sequelize";
import { UserModel } from "../../users/models/user.model";

interface CustomerCreationAttrs {
    firstName: string;
    lastName: string;
    fatherName: string;
    mobilePhone: string;
    email: string;
}

@Table({ tableName: 'customers' })
export class CustomerModel extends Model<CustomerModel, CustomerCreationAttrs> {
    @Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataTypes.STRING, allowNull: false })
    firstName: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    lastName: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    fatherName: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    mobilePhone: string;

    @Column({ type: DataTypes.STRING, unique: true, allowNull: true })
    email: string;

    @ForeignKey(() => UserModel)
    @Column({ type: DataTypes.INTEGER })
    userId: number;

    @BelongsTo(() => UserModel, 'userId')
    user: UserModel;
}