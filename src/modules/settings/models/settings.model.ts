import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { UserModel } from '@modules/users/models/user.model';

interface SettingsCreationAttrs {
    workdayStartTime: string;
    workdayEndTime: string;
    theme: string;
    userId: number;
}

@Table({ tableName: 'settings' })
export class SettingsModel extends Model<SettingsModel, SettingsCreationAttrs> {
    @Column({ type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataTypes.STRING, allowNull: true, defaultValue: '10:00' })
    workdayStartTime: string;

    @Column({ type: DataTypes.STRING, allowNull: true, defaultValue: '20:00' })
    workdayEndTime: string;

    @Column({ type: DataTypes.STRING, allowNull: true, defaultValue: 'light' })
    theme: string;

    @ForeignKey(() => UserModel)
    @Column
    userId: number;

    @BelongsTo(() => UserModel)
    user: UserModel;
}