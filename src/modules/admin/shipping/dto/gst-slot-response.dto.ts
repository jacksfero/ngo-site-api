import { Expose, Transform } from 'class-transformer';
 
 

export class GstSlotResponseDto {
    @Expose()
    key: string;
  
    @Expose()
    value: string;
  }
  
