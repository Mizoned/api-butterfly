import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExpensesModel } from '@modules/expenses/models/expenses.model';

@Module({
	imports: [SequelizeModule.forFeature([ExpensesModel])],
	providers: [ExpensesService],
	controllers: [ExpensesController]
})
export class ExpensesModule {}
