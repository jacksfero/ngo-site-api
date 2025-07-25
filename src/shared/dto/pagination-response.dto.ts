// src/common/dto/pagination-response.dto.ts
export class PaginationResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    last_page: number;
  };

  constructor(data: T[], meta: { total: number; page: number; limit: number }) {
    this.data = data;
    this.meta = {
      ...meta,
      last_page: Math.ceil(meta.total / meta.limit),
    };
  }
}