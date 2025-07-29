// src/modules/client/exhibition/dto/exhibition-list-item.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ExhibitionListItemDto {

   @Expose()
  id: number;

   @Expose()
  ExibitionTitle: string;

   @Expose()
  description: string;

   @Expose()
  dateStart: Date;

   @Expose()
  dateEnd: Date;

   @Expose()
  imageURL: string;

   @Expose()
  exhibitionStatus: boolean;

   @Expose()
  status: boolean;
}