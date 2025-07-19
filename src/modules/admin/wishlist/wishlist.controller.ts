import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { User } from '../../../shared/entities/user.entity';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

import { JwtPayload } from 'src/modules/auth/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
 

@UseGuards(JwtAuthGuard)
@Controller()
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
    @Inject('GLOBAL_VAR') private readonly globalVar: string,
  ) {}

  @Post()
  creates(
    @CurrentUser() user: JwtPayload,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    //const user = req; // ✅ user is available from JWT payload
    // const userId = req.user?.sub; // ✅ Strongly typed
    //  console.log(user,'---------PayLoad---------');

    return this.wishlistService.addToWishlist(user.sub, createWishlistDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    //  return this.globalVar;
    //console.log('---glooooo------' + this.globalVar);
    return this.wishlistService.getUserWishlist(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishlistService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistService.update(+id, updateWishlistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wishlistService.remove(+id);
  }
}
