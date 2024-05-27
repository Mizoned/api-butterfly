import {HttpStatus, Injectable} from '@nestjs/common';
import * as uuid from 'uuid';
import * as path from 'path';
import {ApiException} from "@common/exceptions/api.exception";
import * as fs from "node:fs";
import { FileType } from "@modules/files/types";


@Injectable()
export class FilesService {
    createFile(type: FileType, file: Express.Multer.File): string {
        try {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = uuid.v4() + '.' + fileExtension;
            const filePath = path.resolve(__dirname, '..', '..', 'static', type);

            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, { recursive: true });
            }

            fs.writeFileSync(path.resolve(filePath, fileName), file.buffer);

            return type + '/' + fileName
        } catch (error) {
            throw new ApiException('Не удалось загрузить файл', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    removeFile(fileName: string) {
        try {
            const filePath = path.resolve(__dirname, '..', '..', 'static', fileName);

            fs.unlink(filePath, (error) => {
                if (error) throw error;
            });

            return true;
        } catch (error) {
            throw new ApiException('Не удалось удалить файл', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
