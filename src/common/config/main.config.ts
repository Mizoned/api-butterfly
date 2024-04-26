import { MainConfig } from './interfaces/mainConfig.interface';

export default (): MainConfig => ({
	port: parseInt(process.env.API_PORT, 10) || 3000
});
