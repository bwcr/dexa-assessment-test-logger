import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggingService } from './logging.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const startTime = Date.now();
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    // Add request ID to headers for tracking
    request.headers['x-request-id'] = requestId;
    response.setHeader('x-request-id', requestId);

    // Extract user information if available (from JWT or session)
    const userId = (request as any).user?.id || undefined;

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;

        // Log the API request
        this.loggingService
          .logApiRequest(
            request.method,
            request.originalUrl || request.url,
            response.statusCode,
            responseTime,
            request.headers['user-agent'],
            this.getClientIp(request),
            userId,
            requestId,
          )
          .catch((error) => {
            // Fallback to console logging if RabbitMQ fails
            console.error('Failed to log API request:', error);
          });
      }),
    );
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}
