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
  async uploadFiles(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    if (!request.user) {
      throw new UnauthorizedException();
    }

    console.log(request.user);
    console.log({ file });

    const fileType = this.uploadService.getFileType(file);

    if (fileType === FileType.s3_image) {
    } else if (fileType === FileType.s3_video) {
    }
    return;
  }
}
