import { Controller, Inject, Post } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ThumbnailsService } from './thumbnails.service';

@Controller('test/thumbnails')
export class ThumbnailsController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly thumbnailsService: ThumbnailsService,
  ) {}

  @Post('download')
  async listAll() {
    // const a = await this.thumbnailsService.downloadFile();
    //
    // return a;
  }

  @Post('get')
  async get() {
    const a = await this.thumbnailsService.getItemForThumbnails();

    return a;
  }

  @Post('run')
  async run() {
    const a = await this.thumbnailsService.generateThumbnails();

    return a;
  }
}
