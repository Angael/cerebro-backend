import { Controller, Get, Inject } from '@nestjs/common';
import { UploadService } from './upload.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

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
}
