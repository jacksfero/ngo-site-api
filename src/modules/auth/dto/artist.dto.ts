import { Exclude, Expose,Type } from 'class-transformer';


@Exclude()
export class ProfileImageDto {
  @Expose()
  id: number;

  @Expose()
  imageUrl: string;

  @Expose()
  userId: number;
}



@Exclude()
export class ArtistDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
 
  @Expose()
  @Type(() => ProfileImageDto)
  profileImage: ProfileImageDto;


}
 


