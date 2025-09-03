
 
import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";
//import { Transform } from 'class-transformer';

export class CreateExhibitionDto {

    @IsString()
    ExibitionTitle: string;

    @IsString()
    description: string;

    @IsOptional()
   // @IsDateString()
    dateStart: Date;

    @IsOptional()
    //@IsDateString()
    dateEnd: Date;
 
    @IsOptional()
    @IsString()
    imageURL?: string | null;
 
    @IsOptional()
    @IsBoolean()
    exhibitionStatus?: boolean;

    @IsOptional()
    @IsBoolean()
    status: boolean;

  /*  @IsOptional()
    @IsBoolean()
    status?: boolean;*/
 /*
    @IsBoolean()
    @Transform(({ value }) => {
        console.log("Typeof:------", typeof value); 

      if (typeof value === 'boolean') { 
       
        console.log("status value------",value);
        return value; }
  
      if (typeof value === 'string') {
        console.log("true value------",value);
        const lower = value.trim().toLowerCase();
        if (lower === 'true' || lower === '1') {
            console.log("true value------",lower);
            return true;
        }
        if (lower === 'false' || lower === '0') { 
            console.log("false value------",lower);
            return false;
        }
      }
  
      return value;
    })
    status: boolean;


 
*/
}
