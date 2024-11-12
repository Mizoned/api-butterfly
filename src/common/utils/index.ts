import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
	return await bcrypt.hash(password, 10);
};

export const comparePassword = async (
	password: string,
	hashedPassword: string
): Promise<boolean> => {
	return await bcrypt.compare(password, hashedPassword);
};


export const isCurrentMonth = (date: Date) => {
	const currentDate = new Date();

	return currentDate.getFullYear() === date.getFullYear() && currentDate.getMonth() === date.getMonth();
}

export const getWeekDays = (date: Date): Date[] => {
	const current = new Date(date);

	// Определяем текущий день недели (0 - воскресенье)
	const dayOfWeek = current.getDay();

	// Смещаем текущий день на понедельник, если он не является первым днём недели
	const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
	current.setDate(current.getDate() + diffToMonday);

	const weekDays: Date[] = [];

	for (let i = 0; i < 7; i++) {
		weekDays.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	return weekDays;
}