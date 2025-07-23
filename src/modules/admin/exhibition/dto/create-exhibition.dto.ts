import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class CreateExhibitionDto {

    @IsString()
    ExibitionTitle: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsDateString()
    DateStart: Date;

    @IsOptional()
    @IsDateString()
    DateEnd: Date;


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
