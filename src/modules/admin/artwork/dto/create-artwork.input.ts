import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateArtworkInput {

  @Field()
  title: string;

  @Field()
  artistName: string;

  @Field(() => Int)
  price: number;

}