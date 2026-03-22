import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Artwork } from './artwork.entity';
import { ArtworkService } from './artwork.service';
import { CreateArtworkInput } from './dto/create-artwork.input';

@Resolver(() => Artwork)
export class ArtworkResolver {

  constructor(private artworkService: ArtworkService) {}

  @Query(() => [Artwork])
  artworks() {
    return this.artworkService.findAll();
  }

  @Mutation(() => Artwork)
  createArtwork(
    @Args('input') input: CreateArtworkInput
  ) {
    return this.artworkService.create(input);
  }

}