import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
