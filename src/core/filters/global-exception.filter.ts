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

    // ✅ CRITICAL: Check if headers already sent
    if (response.headersSent) {
      this.logger.warn('Headers already sent, skipping exception filter');
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

    // Log the error
    this.logger.error('🚨 Global Error:', {
      url: request.url,
      method: request.method,
      status,
      error: exception instanceof Error ? exception.message : exception,
    });

    // Check for circular reference errors
    if (exception instanceof Error && 
        (exception.message.includes('circular') || 
         exception.stack?.includes('TransformOperationExecutor'))) {
      this.logger.error('🔴 CIRCULAR REFERENCE DETECTED');
    }

    try {
      // ✅ Send formatted error response (ONCE)
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: typeof message === 'string' ? message : (message as any).message,
      });
    } catch (sendError) {
      // ✅ If sending response fails, log but don't try to send again
      this.logger.error('Failed to send error response:', sendError);
    }
  }
}