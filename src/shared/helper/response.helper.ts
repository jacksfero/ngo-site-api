export function successResponse<T>(message: string, data?: T) {
  return { success: true, message, data };
}

export function errorResponse(message: string, error?: any) {
  return { success: false, message, error };
}
