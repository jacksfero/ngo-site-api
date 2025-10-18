import { IsOptional,IsEnum, IsBoolean, IsString } from 'class-validator';
import { Transform, } from 'class-transformer';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';
import { ContactUsType } from 'src/modules/admin/contactus/enums/contact-us-type.enum';


export class ContactPaginationDto extends PaginationBaseDto {
//   @IsOptional()
//   @IsBoolean()
//   @Transform(({ value }) => value === 'true' || value === true)
//   status?: boolean;

    @IsOptional()
    @IsEnum(ContactUsType)
    type?: ContactUsType; // For direct status input
}
