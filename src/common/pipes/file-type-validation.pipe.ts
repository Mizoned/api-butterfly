import {PipeTransform, Injectable, HttpStatus} from '@nestjs/common';
import {ApiException} from "@common/exceptions/api.exception";

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
    constructor(
        private readonly fieldName: string,
        private readonly errorMessage: string,
        private readonly types: Array<string>
    ) {}

    transform(file: Express.Multer.File) {
        if (!this.types.includes(file.mimetype)) {
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