import { Injectable } from '@nestjs/common';
import { name, version } from '../package.json';

@Injectable()
export class AppService {
  getIndexVersionResponse(): string {
    return `${name} v${version}`;
  }
}
