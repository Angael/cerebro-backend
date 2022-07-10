import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Logger } from 'winston';
import { FileInterceptor } from '@nestjs/platform-express';
import { performance } from 'perf_hooks';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { ItemsService } from './items.service';
import { multerOptions } from './upload/multer-configs/multerConfig';
import { UploadService } from './upload/upload.service';
import { TokenGuard } from '../auth/guards/token.guard';
import { User } from '../auth/decorators/user.decorator';
import firebase from 'firebase-admin';
import { PremiumGuard } from '../auth/guards/premium.guard';
import { MAX_UPLOAD_SIZE } from '../utils/consts';

@Controller('items')
export class ItemsController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly itemsService: ItemsService,
    private readonly uploadService: UploadService,
  ) {}

  // List all items
  @UseGuards(TokenGuard, PremiumGuard)
  @Get()
  async listAll() {
    const items = await this.itemsService.getAll();

    return items;
  }

  @Get('item/:id')
  async getItem(@Param('id') id: number) {
    const item = await this.itemsService.getItem(id);

    return item;
  }

  @UseGuards(TokenGuard)
  @Delete('item/:id')
  async deleteItem(@User() user: firebase.auth.DecodedIdToken, @Param('id') id: number) {
    console.log('id', id, typeof id);
    await this.itemsService.deleteItem(id, user.uid);

    return;
  }

  // @Get(':drive')
  // listDrive(
  //   @Param('drive') id: string,
  //   @Query('howMany') howMany: string,
  //   @Query('offset') offset: string,
  // ) {
  //   console.log({ id, howMany, offset });
  //   return this.itemsService.getUserItems();
  // }

  // TODO ADD gouard/pipe/middleware/check for determining storage that is left.
  @UseGuards(TokenGuard)
  @Post('upload/file')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @User() user: firebase.auth.DecodedIdToken,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    if (file.size > MAX_UPLOAD_SIZE) {
      throw new BadRequestException('File too big');
    }

    const startTime = performance.now();

    await this.uploadService.handleFile(file, user);

    this.logger.verbose(`uploadFile - ${performance.now() - startTime} ms`);

    return;
  }
}
