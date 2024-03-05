import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from "sequelize";
import { UserModel } from "../../users/models/user.model";

interface ProductCreationAttrs {
    name: string;
    price: number;
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
}