// pagination.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class PaginationClinetPipe implements PipeTransform {
  constructor(
    private readonly defaultLimit = 10,
    private readonly maxLimit = 100,
    private readonly defaultPage = 1,
  ) {}

  transform(value: any, metadata: ArgumentMetadata): any {
    const { page, limit, ...rest } = value;

    // Parse and validate page (SAME LOGIC AS BEFORE)
    const parsedPage = parseInt(page, 10);
    const finalPage = isNaN(parsedPage) || parsedPage < 1 ? this.defaultPage : parsedPage;

    // Parse and validate limit with max cap (SAME LOGIC AS BEFORE)
    const parsedLimit = parseInt(limit, 10);
    const finalLimit = isNaN(parsedLimit) || parsedLimit < 1
      ? this.defaultLimit
      : Math.min(parsedLimit, this.maxLimit);

    // RETURN ALL PROPERTIES (ONLY CHANGE - PRESERVES categoryId, artistId, etc.)
    return {
      ...rest, // This preserves ALL other properties
      page: finalPage,
      limit: finalLimit,
    };
  }
}