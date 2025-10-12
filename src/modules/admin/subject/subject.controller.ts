import { Controller, ParseIntPipe,Get, Post, Body, Patch, Param, Delete , Req,} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}
 
  @Get('list')
  @RequirePermissions('read_subject')
  getActiveList() {
    return this.subjectService.getActiveList();
  }

  @Post()
   @RequirePermissions('create_subject')
  create(@Body() createSubjectDto: CreateSubjectDto, @Req() req) {
    const user = req.user;
    return this.subjectService.create(createSubjectDto,user);
  }

  @Get()
  @RequirePermissions('read_subject')
  findAll() {
    return this.subjectService.findAll();
  }

  @Get(':id')
   @RequirePermissions('read_subject')
  findOne(@Param('id') id: string) {
    return this.subjectService.findOne(+id);
  }

  @Patch(':id')
   @RequirePermissions('update_subject')
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto, @Req() req) {
    return this.subjectService.update(+id, updateSubjectDto,req.user);
  }

  @Delete(':id')
   @RequirePermissions('delete_subject')
  remove(@Param('id') id: string) {
    return this.subjectService.remove(+id);
  }
  @Patch(':id/toggle-status')
    async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.subjectService.toggleStatus(id, req.user);
    }
}
