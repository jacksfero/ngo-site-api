import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class CreateExhibitionDto {

    @IsString()
    ExibitionTitle: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsDateString()
    dateStart: Date;

    @IsOptional()
    @IsDateString()
    dateEnd: Date;


    @IsOptional()
    @IsString()
    imageURL: string;
 
    @IsOptional()
    @IsBoolean()
    exhibitionStatus?: boolean;

    @IsOptional()
    @IsBoolean()
    status?: boolean;

}
