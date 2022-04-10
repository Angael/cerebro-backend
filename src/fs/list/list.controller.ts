import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListService } from './list.service';

@Controller('fs/list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get()
  listAll() {
    return this.listService.getAll();
  }

  @Get(':drive')
  listDrive(
    @Param('drive') id: string,
    @Query('howMany') howMany: string,
    @Query('offset') offset: string,
  ) {
    console.log({ id, howMany, offset });
    return this.listService.getUserItems();
  }
}
