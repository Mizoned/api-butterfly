import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApiError, ApiException } from '@common/exceptions/api.exception';

interface ApiErrorResponse {
    message: string,
    errors?: ApiError[],
    statusCode: number,
    timestamp?: string,
    path?: any
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
                statusCode: httpStatus,
            }
        } else {
            httpStatus =
                exception instanceof HttpException
                    ? exception.getStatus()
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            responseBody = {
                message: 'Произошла непредвиденная ошибка',
                statusCode: httpStatus,
                timestamp: new Date().toISOString(),
                path: httpAdapter.getRequestUrl(ctx.getRequest()),
            };
        }
        console.log('Exception filter', exception)

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
