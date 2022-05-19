import {
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
import { IFrontItem } from '../models/for-frontend/IFrontItem';

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
  async listAll(): Promise<IFrontItem[]> {
    const items = await this.itemsService.getAll();

    return items;
  }

  @Get('item/:id')
  async getItem(@Param('id') id: number): Promise<IFrontItem> {
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

  // TODO ADD gouard/pipe/middleware for determining storage that is left.
  @UseGuards(TokenGuard)
  @Post('upload/file')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @User() user: firebase.auth.DecodedIdToken,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const startTime = performance.now();

    const fileType = this.uploadService.getFileType(file);

    await this.uploadService.handleFile(file, user);

    const endTime = performance.now();
    this.logger.verbose(`uploadFile - ${endTime - startTime} ms`);

    return;
  }
}
