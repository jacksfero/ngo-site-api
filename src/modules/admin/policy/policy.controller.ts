import { Controller,ParseIntPipe, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Controller()
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  create(@Body() createPolicyDto: CreatePolicyDto, @Req() req) {
    return this.policyService.create(createPolicyDto, req.user);
  }

  @Get()
  findAll() {
    return this.policyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.policyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePolicyDto: UpdatePolicyDto, @Req() req) {
    return this.policyService.update(+id, updatePolicyDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.policyService.remove(+id);
  }

   @Patch(':id/toggle-status')
      async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this.policyService.toggleStatus(id, req.user);
      }
  

}
