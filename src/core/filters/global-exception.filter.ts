// common/filters/global-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log the error
    console.error('🚨 Global Error:', {
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      status,
      error: exception,
      stack: exception instanceof Error ? exception.stack : 'No stack'
    });

    // Check for circular reference errors
    if (exception instanceof Error && 
        (exception.message.includes('circular') || 
         exception.stack?.includes('TransformOperationExecutor'))) {
      console.error('🔴 CIRCULAR REFERENCE DETECTED in:', request.url);
    }

    // Send formatted error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message,
    });
  }
}