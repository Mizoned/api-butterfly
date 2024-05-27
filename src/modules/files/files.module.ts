import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { MulterModule } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";

@Module({
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
