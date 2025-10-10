import { Controller, Get, Query } from '@nestjs/common';
import { MisService } from './mis.service';
import { DateRangeDto } from './dtos/date-range.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
export class MisController {
  constructor(private readonly misService: MisService) {}

  // Summary Report
  @Get('summary')
  @RequirePermissions('mis_data')
  async getSummary(@Query() query: DateRangeDto) {
    return this.misService.getSummary(query);
  }

  // Product Analytics
  @Get('product-stats')
   @RequirePermissions('mis_data')
  async getProductStats() {
    return this.misService.getProductStats();
  }
}
