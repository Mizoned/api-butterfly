import { Table, Column, Model, HasMany } from 'sequelize-typescript';
import { DataTypes } from "sequelize";
import { ProductModel } from "../../products/models/product.model";
import {CustomerModel} from "../../customers/models/customer.model";

interface UserCreationAttrs {
    firstName: string;
    lastName: string;
    fatherName: string;
    mobilePhone: string;
    email: string;
    password: string;
}

@Table({ tableName: 'users' })
export class UserModel extends Model<UserModel, UserCreationAttrs> {
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

    @Column({ type: DataTypes.STRING, allowNull: false })
    password: string;

    @HasMany(() => CustomerModel, 'userId')
    customer: CustomerModel[];

    @HasMany(() => ProductModel, 'userId')
    product: ProductModel[];
}