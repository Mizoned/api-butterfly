import {PipeTransform, Injectable, HttpStatus} from '@nestjs/common';
import {ApiException} from "@common/exceptions/api.exception";

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
    constructor(
        private readonly fieldName: string,
        private readonly errorMessage: string,
        private readonly maxSize: number = Infinity
    ) {}

    async transform(file: Express.Multer.File) {
        if (file.size > this.maxSize) {
            throw new ApiException('Ошибка валидации полей', HttpStatus.BAD_REQUEST, [
                {
                    property: this.fieldName,
                    message: this.errorMessage
                }
            ]);
        }

        return file;
    }
}