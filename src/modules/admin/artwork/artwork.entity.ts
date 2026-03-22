import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Artwork {

  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  artistName: string;

  @Field(() => Int)
  price: number;

}