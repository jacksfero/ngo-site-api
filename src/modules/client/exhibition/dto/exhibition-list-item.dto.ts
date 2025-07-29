// src/modules/client/exhibition/dto/exhibition-list-item.dto.ts

export class ExhibitionListItemDto {
  id: number;
  ExibitionTitle: string;
  description: string;
  dateStart: Date;
  dateEnd: Date;
  imageURL: string;
  exhibitionStatus: boolean;
  status: boolean;
}