import { PartialType } from '@nestjs/mapped-types';
import { CreateBankDetailDto } from './create-user-bank-detail.dto';
 

export class UpdateBankDetailDto extends PartialType(CreateBankDetailDto) {}