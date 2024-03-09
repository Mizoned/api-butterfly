import { HttpException } from '@nestjs/common';

export interface ApiError {
    property: string,
    message: string
}

export class ApiException extends HttpException {
    constructor(message: string, status: number, readonly errors?: ApiError[]) {
        super(message, status);
    }
}