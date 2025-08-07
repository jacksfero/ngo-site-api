import { Controller, ParseIntPipe,Get, Post, Body, Patch, Param, Delete , Req,} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Controller()
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}
 
  @Get('list')
  getActiveList() {
    return this.subjectService.getActiveList();
  }

  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto, @Req() req) {
    const user = req.user;
    return this.subjectService.create(createSubjectDto,user);
  }

  @Get()
  findAll() {
    return this.subjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto, @Req() req) {
    return this.subjectService.update(+id, updateSubjectDto,req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectService.remove(+id);
  }
  @Patch(':id/toggle-status')
    async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.subjectService.toggleStatus(id, req.user);
    }
}
