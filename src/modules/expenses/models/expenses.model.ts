import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { UserModel } from '@modules/users/models/user.model';

interface ExpensesCreationAttrs {
    name: string;
    price: number;
    userId: number;
    date: Date;
}

@Table({ tableName: 'expenses' })
export class ExpensesModel extends Model<ExpensesModel, ExpensesCreationAttrs> {
    @Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataTypes.STRING, allowNull: false })
    name: string;

    @Column({ type: DataTypes.FLOAT, allowNull: false })
    price: number;

    @Column({ type: DataTypes.DATE, allowNull: false })
    date: Date;

    @ForeignKey(() => UserModel)
    @Column({ type: DataTypes.INTEGER })
    userId: number;

    @BelongsTo(() => UserModel, 'userId')
    user: UserModel;
}