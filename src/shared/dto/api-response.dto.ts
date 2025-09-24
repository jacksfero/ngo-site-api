// common/dto/api-response.dto.ts
export interface ApiResponse<T = any> {
  success: true;
  message: string;
  data: T;
}
