// update-users-about.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersAboutDto } from './create-users-about.dto';

export class UpdateUsersAboutDto extends PartialType(CreateUsersAboutDto) {}