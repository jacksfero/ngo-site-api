import { Controller,Req, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ExhibitionService } from './exhibition.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { ExhibitionDetailDto } from './dto/exhibition-detail.dto';
import { AuthRequest } from 'src/core/types/auth-request.type';

@Controller()
export class ExhibitionController {
  constructor(private readonly exhibitionService: ExhibitionService) {}

//  @Post('view')
//   addView(@Req() req: AuthRequest) {
//     const viewerIdentifier =
//       req.user?.id ||
//       req.cookies?.viewerId ||
//       req.headers['x-forwarded-for'] ||
//       req.socket.remoteAddress;

//     return this.exhibitionService.addGlobalView(String(viewerIdentifier));
//   }
@Post('view')
addView(
  @Body('page') page: string,
  @Req() req: AuthRequest,
) {
  const viewerIdentifier =
    req.headers['x-forwarded-for']?.toString() ||
    req.socket.remoteAddress;

  return this.exhibitionService.addPageView(page, String(viewerIdentifier));
}

 @Post('like')
async addLike( @Body('page') page: string,@Req() req: AuthRequest) {
  const viewerIdentifier =
    req.user?.id ||
    req.cookies?.viewerId ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress;

  return this.exhibitionService.likePage(page,String(viewerIdentifier));
}

@Get('stats')
getStats(@Query('page') page: 'list' | 'live') {
  return this.exhibitionService.getExhibitionStats(page);
}

 // ✅ Get currently live exhibitions
  @Get('status/live')
  async findLive(@Query('currency') currency?: string,): Promise<ExhibitionDetailDto[]> {
    return this.exhibitionService.findLiveExhibitions(currency);
  }



  @Get()
findAllPublic(@Query() paginationDto: PaginationDto) {
 // console.log('aaaaaaaaaaaaaaaa================');
  return this.exhibitionService.findPublicAll(paginationDto);
}

@Get('nextexhi/:id')
nextonlineExhi(@Param('id', ParseIntPipe) id: number) {
 // console.log('id-------------',id)
  return this.exhibitionService.nextonlineExhi(id);
}

@Get('isliveexhibition')
isLiveExhibition() {  
  return this.exhibitionService.isLiveExhibition();
}



@Get('exhi/:id')
findOnePublicexh(@Param('id', ParseIntPipe) id: number) {
  return this.exhibitionService.getExhibitionArtistsWithProductCount(id);
}

@Get(':id')
findOnePublic(@Param('id', ParseIntPipe) id: number) {
  return this.exhibitionService.findOnePublic(id);
}

}
