// pagination.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PaginationBaseDto } from '../dto/pagination-base.dto';

@Injectable()
export class PaginationPipe implements PipeTransform {
  constructor(
    private readonly defaultLimit = 10,
    private readonly maxLimit = 100,
    private readonly defaultPage = 1,
  ) {}

  transform(value: any, metadata: ArgumentMetadata): PaginationBaseDto {
    const { page, limit, search } = value;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const dto = new PaginationBaseDto();
    dto.page = isNaN(parsedPage) || parsedPage < 1 ? this.defaultPage : parsedPage;
    dto.limit = isNaN(parsedLimit) || parsedLimit < 1
      ? this.defaultLimit
      : Math.min(parsedLimit, this.maxLimit);
    dto.search = typeof search === 'string' ? search.trim() : '';

    const errors = validateSync(plainToInstance(PaginationBaseDto, dto));
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
    }

    return dto;
  }
}




/*import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class PaginationPipe implements PipeTransform {
  constructor(
    private readonly defaultLimit = 10,
    private readonly maxLimit = 100,
    private readonly defaultPage = 1,
  ) {}

  transform(value: any, metadata: ArgumentMetadata): PaginationDto {
    const { page, limit, search, status, role } = value;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const dto = new PaginationDto();
    dto.page = isNaN(parsedPage) || parsedPage < 1 ? this.defaultPage : parsedPage;
    dto.limit = isNaN(parsedLimit) || parsedLimit < 1
      ? this.defaultLimit
      : Math.min(parsedLimit, this.maxLimit);

    dto.search = typeof search === 'string' ? search.trim() : '';
    dto.status = typeof status === 'string' ? status.trim() : undefined;
    dto.role = typeof role === 'string' ? role.trim() : undefined;

    const errors = validateSync(plainToInstance(PaginationDto, dto));
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
    }

    return dto;
  }
}
*/