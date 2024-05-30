import { HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { ApiException } from "@common/exceptions/api.exception";
import * as fs from "node:fs";
import { FileType } from "@modules/files/types";
import { promisify } from 'util';
import { ConfigService } from "@nestjs/config";

const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);
const accessAsync = promisify(fs.access);

@Injectable()
export class FilesService {
    constructor(private readonly configService: ConfigService) {}

    async createFile(type: FileType, file: Express.Multer.File): Promise<string> {
        try {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const filePath = path.resolve(__dirname, '..', '..', '..', this.configService.get('UPLOADS_DEST'), type);

            try {
                await accessAsync(filePath);
            } catch (e) {
                await mkdirAsync(filePath, { recursive: true });
            }

            await writeFileAsync(path.resolve(filePath, fileName), file.buffer);

            return `${type}/${fileName}`;
        } catch (error) {
            throw new ApiException('Не удалось загрузить файл', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeFile(fileName: string): Promise<boolean> {
        const filePath = path.resolve(__dirname, '..', '..', '..', this.configService.get('UPLOADS_DEST'), fileName);

        try {
            const fileExists = await existsAsync(filePath);
            if (fileExists) {
                await unlinkAsync(filePath);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw new ApiException('Не удалось удалить файл', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
