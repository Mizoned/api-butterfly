import { Table, Column, Model } from 'sequelize-typescript';
import { DataTypes } from "sequelize";

interface ProductCreationAttrs {
    name: string;
    price: string;
}

@Table({ tableName: 'products' })
export class ProductModel extends Model<ProductModel, ProductCreationAttrs> {
    @Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataTypes.STRING, allowNull: false })
    name: string;

    @Column({ type: DataTypes.NUMBER, allowNull: false })
    price: number;
}