import { Injectable } from '@nestjs/common';

import { DbService } from '../../providers/db.service';

@Injectable()
export class VideoService {
  constructor(private readonly dbService: DbService) {}
}
