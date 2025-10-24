// src/core/filters/global-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

     // ✅ Skip for logout endpoint to avoid 401 errors
  if (request.url.includes('/auth/logout')) {
    return response.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  // ... rest of your exception handling
 

    // ✅ Skip for OPTIONS requests
    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }

    // ✅ Check if headers already sent
    if (response.headersSent) {
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    this.logger.error(`Error ${status}: ${request.method} ${request.url}`);

    try {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: typeof message === 'string' ? message : (message as any).message,
      });
    } catch (error) {
      this.logger.error('Failed to send error response');
    }
  }
}