import { Injectable } from '@nestjs/common';
import { LogEntry } from './domain/log-entry';
import { LogLevel } from './domain/log-level.enum';
import { RabbitMQProducerService } from './rabbitmq-producer.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingService {
  constructor(
    private readonly rabbitMQProducerService: RabbitMQProducerService,
  ) {}

  async logError(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    requestId?: string,
  ): Promise<void> {
    await this.log(LogLevel.ERROR, message, context, metadata, requestId);
  }

  async logWarn(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    requestId?: string,
  ): Promise<void> {
    await this.log(LogLevel.WARN, message, context, metadata, requestId);
  }

  async logInfo(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    requestId?: string,
  ): Promise<void> {
    await this.log(LogLevel.INFO, message, context, metadata, requestId);
  }

  async logDebug(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    requestId?: string,
  ): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context, metadata, requestId);
  }

  async logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userAgent?: string,
    ip?: string,
    userId?: number,
    requestId?: string,
  ): Promise<void> {
    const logEntry = new LogEntry({
      level:
        statusCode >= 500
          ? LogLevel.ERROR
          : statusCode >= 400
            ? LogLevel.WARN
            : LogLevel.INFO,
      message: `${method} ${url} - ${statusCode} (${responseTime}ms)`,
      context: 'API_REQUEST',
      method,
      url,
      statusCode,
      responseTime,
      userAgent,
      ip,
      userId,
      requestId: requestId || uuidv4(),
    });

    await this.rabbitMQProducerService.publishLogEntry(logEntry);
  }

  private async log(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    requestId?: string,
  ): Promise<void> {
    const logEntry = new LogEntry({
      level,
      message,
      context,
      metadata,
      requestId: requestId || uuidv4(),
    });

    await this.rabbitMQProducerService.publishLogEntry(logEntry);
  }
}
