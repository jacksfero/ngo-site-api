/// src/core/filters/global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) return;

    // Skip OPTIONS requests
    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    }

    // ✅ CRITICAL FIX: Only log as "Route not found" for actual routing 404s
    // Not for business logic 404s
    if (status === HttpStatus.NOT_FOUND) {
      // Check if this is a genuine "route not found" or a business 404
      const isRouteNotFound = this.isActualRouteNotFound(request, exception);
      
      if (isRouteNotFound) {
        this.logger.warn(`Route not found: ${request.method} ${request.url}`);
        return response.status(HttpStatus.NOT_FOUND).json({
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Route not found',
          path: request.url,
          timestamp: new Date().toISOString(),
        });
      } else {
        // This is a business logic 404 (like "artist not found")
        // Preserve the original message from the service
        this.logger.warn(`Resource not found: ${request.method} ${request.url}`);
      }
    }

    // Log based on status code
    if (status >= 500) {
      this.logger.error(
        `Server error ${status}: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else if (status >= 400 && status !== 404) { // Don't double-log 404s
      this.logger.warn(`Client error ${status}: ${request.method} ${request.url}`);
    }

    // Build response - preserve original messages
    const responseBody: any = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (typeof message === 'string') {
      responseBody.message = message;
    } else if (message && typeof message === 'object') {
      responseBody.message = (message as any).message || 'Not found';
      // Include additional details for validation errors, etc.
      if ((message as any).error || (message as any).details) {
        responseBody.details = message;
      }
    }

    return response.status(status).json(responseBody);
  }

  /**
   * Determine if a 404 is an actual "route not found" or a business logic 404
   */
  private isActualRouteNotFound(request: Request, exception: unknown): boolean {
    // If it's a NotFoundException with default message, it's likely route not found
    if (exception instanceof NotFoundException) {
      const message = exception.message;
      return message === 'Cannot GET ' + request.url || 
             message === 'Cannot POST ' + request.url ||
             message === 'Cannot PUT ' + request.url ||
             message === 'Cannot DELETE ' + request.url ||
             message === 'Cannot PATCH ' + request.url ||
             message.includes('Cannot') && message.includes(request.url);
    }

    // If the exception has a custom message, it's likely business logic
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && (response as any).message) {
        const msg = (response as any).message;
        // Business logic 404s usually have specific messages
        if (msg.includes('not found') || 
            msg.includes('not exist') || 
            msg.includes('no') && msg.includes('found')) {
          return false; // Business 404
        }
      }
    }

    // Default to treating as route not found for safety
    return true;
  }
}