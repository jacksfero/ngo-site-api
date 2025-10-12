import { Controller,ParseIntPipe, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
   @RequirePermissions('create_policy')
  create(@Body() createPolicyDto: CreatePolicyDto, @Req() req) {
    return this.policyService.create(createPolicyDto, req.user);
  }

  @Get()
  @RequirePermissions('read_policy')
  findAll() {
    return this.policyService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read_policy')
  findOne(@Param('id') id: string) {
    return this.policyService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update_policy')
  update(@Param('id') id: string, @Body() updatePolicyDto: UpdatePolicyDto, @Req() req) {
    return this.policyService.update(+id, updatePolicyDto, req.user);
  }

  @Delete(':id')
  @RequirePermissions('delete_policy')
  remove(@Param('id') id: string) {
    return this.policyService.remove(+id);
  }

   @Patch(':id/toggle-status')
   @RequirePermissions('update_policy')
      async toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this.policyService.toggleStatus(id, req.user);
      }
  

}
