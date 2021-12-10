import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RegisterService } from './register.service';

import { RegisterDto } from './dto/register.dto';

@Controller('account/register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post()
  create(@Body() registerDto: RegisterDto) {
    return this.registerService.create(registerDto);
  }

  // @Get()
  // findAll() {
  //   return this.registerService.findAll();
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.registerService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRegisterDto: UpdateRegisterDto) {
  //   return this.registerService.update(+id, updateRegisterDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.registerService.remove(+id);
  // }
}
