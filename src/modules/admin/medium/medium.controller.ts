import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { MediumService } from './medium.service';
import { CreateMediumDto } from './dto/create-medium.dto';
import { UpdateMediumDto } from './dto/update-medium.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class MediumController {
  constructor(private readonly mediumService: MediumService) {}

  @Get('list')
  @RequirePermissions('read_medium')
  getActiveList() {
    return this.mediumService.getActiveList();
  }


  @Post()
   @RequirePermissions('create_medium')
  create(@Body() createMediumDto: CreateMediumDto, @Req() req) {
    const user = req.user;
    return this.mediumService.create(createMediumDto, user);
  }

  @Get()
   @RequirePermissions('read_medium')
  findAll() {
    return this.mediumService.findAll();
  }

  @Get(':id')
   @RequirePermissions('read_medium')
  findOne(@Param('id') id: string) {
    return this.mediumService.findOne(+id);
  }

  @Patch(':id')
   @RequirePermissions('update_medium')
  update(@Param('id') id: string, @Body() updateMediumDto: UpdateMediumDto, @Req() req) {
    return this.mediumService.update(+id, updateMediumDto, req.user);
  }

  @Delete(':id')
   @RequirePermissions('delete_medium')
  remove(@Param('id') id: string) {
    return this.mediumService.remove(+id);
  }

   @Patch(':id/toggle-status')
   @RequirePermissions('update_medium')
    async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.mediumService.toggleStatus(id, req.user);
    }
}
