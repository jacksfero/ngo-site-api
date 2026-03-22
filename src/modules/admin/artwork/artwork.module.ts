import { Module } from '@nestjs/common';
import { ArtworkResolver } from './artwork.resolver';
import { ArtworkService } from './artwork.service';

@Module({
  providers: [ArtworkResolver, ArtworkService],
})
export class ArtworkModule {}