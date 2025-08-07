import { Expose } from 'class-transformer';

export class SubjectResponseDto {
  @Expose()
  id: number;

  @Expose()
  subject: string;

  /*@Expose()
  status: boolean;

  @Expose()
  createdAt: Date;*/
}