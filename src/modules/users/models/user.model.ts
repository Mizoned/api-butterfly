import { Table, Column, Model, HasMany, HasOne } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { ProductModel } from '@modules/products/models/product.model';
import { CustomerModel } from '@modules/customers/models/customer.model';
import { ScheduleModel } from '@modules/schedules/models/schedule.model';
import { TokenModel } from '@modules/tokens/models/token.model';
import { ExpensesModel } from '@modules/expenses/models/expenses.model';
import { SettingsModel } from '@modules/settings/models/settings.model';

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

    @Column({ type: DataTypes.STRING, allowNull: true })
    firstName: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    lastName: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    fatherName: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    mobilePhone: string;

    @Column({ type: DataTypes.STRING, unique: true, allowNull: true })
    email: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    password: string;

    @HasOne(() => TokenModel, 'userId')
    token: TokenModel

    @HasOne(() => SettingsModel, 'userId')
    settings: SettingsModel

    @HasMany(() => CustomerModel, 'userId')
    customers: CustomerModel[];

    @HasMany(() => ProductModel, 'userId')
    products: ProductModel[];

    @HasMany(() => ScheduleModel, 'userId')
    schedules: ScheduleModel[];

    @HasMany(() => ExpensesModel, 'userId')
    expenses: ExpensesModel[];
}