import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApiError, ApiException } from '@common/exceptions/api.exception';

interface ApiErrorResponse {
	message?: string;
	errors?: ApiError[];
	statusCode: number;
	timestamp?: string;
	path?: any;
}

interface ServeStaticError {
	errno: number,
	code: string,
	syscall: string,
	path: string,
	expose: boolean,
	statusCode: number,
	status: number
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;

		const ctx = host.switchToHttp();

		let responseBody: ApiErrorResponse, httpStatus: number;

		if (exception instanceof ApiException) {
			httpStatus = exception.getStatus();
			responseBody = {
				message: exception.message,
				errors: exception.errors,
				statusCode: httpStatus
			}
		} else if (exception instanceof HttpException) {
			httpStatus = exception.getStatus();
			responseBody = {
				message: exception.message,
				statusCode: httpStatus,
			}
		} else if (typeof exception === 'object' && 'statusCode' in (exception as ServeStaticError)) {
			const staticException = exception as ServeStaticError;
			httpStatus = staticException.statusCode;
			responseBody = {
				message: 'Ошибка обращения к статическим файлам',
				statusCode: httpStatus,
			}
		} else {
			httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
			responseBody = {
				message: 'Произошла непредвиденная ошибка',
				statusCode: httpStatus,
			};
		}

		responseBody.timestamp = new Date().toISOString();
		responseBody.path = httpAdapter.getRequestUrl(ctx.getRequest());

		console.log('Exception filter', exception);

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}
