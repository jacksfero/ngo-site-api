// users-about-response.dto.ts
import { Expose } from 'class-transformer';

export class UsersAboutResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  about: string;

  @Expose()
  awards: string;

  @Expose()
  shows: string;

  @Expose()
  exhibition: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}