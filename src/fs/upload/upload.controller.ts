import {
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
const { performance } = require('perf_hooks');

import { UploadService } from './upload.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions, storage } from './multerConfig';
import { FileType } from '../../models/IItem';

@Controller('fs/upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('items')
  async getItems(): Promise<any> {
    const listIHope = await this.uploadService.getItemsList();
    this.logger.info(`Get items`, listIHope);
    return listIHope;
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    var startTime = performance.now();

    if (!request.user) {
      throw new UnauthorizedException();
    }

    const fileType = this.uploadService.getFileType(file);

    await this.uploadService.handleFile(file, request.user);
    var endTime = performance.now();
    this.logger.info(`uploadFile - ${endTime - startTime} ms`);
    return;
  }
}
