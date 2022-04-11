import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './upload/multer-configs/multerConfig';
import { Request } from 'express';
import { performance } from 'perf_hooks';
import { UploadService } from './upload/upload.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller('items')
export class ItemsController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly listService: ItemsService,
    private readonly uploadService: UploadService,
  ) {}

  // List all items
  @Get()
  listAll() {
    return this.listService.getAll();
  }

  // @Get(':drive')
  // listDrive(
  //   @Param('drive') id: string,
  //   @Query('howMany') howMany: string,
  //   @Query('offset') offset: string,
  // ) {
  //   console.log({ id, howMany, offset });
  //   return this.listService.getUserItems();
  // }

  // Upload any file
  @Post('upload/file')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const startTime = performance.now();

    if (!request.user) {
      throw new UnauthorizedException();
    }

    const fileType = this.uploadService.getFileType(file);

    await this.uploadService.handleFile(file, request.user);

    const endTime = performance.now();
    this.logger.verbose(`uploadFile - ${endTime - startTime} ms`);

    return;
  }
}
