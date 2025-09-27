import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { AllConfigType } from '../config/config.type';
import { LogEntry } from './domain/log-entry';

@Injectable()
export class RabbitMQProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQProducerService.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const host = this.configService.getOrThrow('rabbitmq.host', {
        infer: true,
      });
      const port = this.configService.getOrThrow('rabbitmq.port', {
        infer: true,
      });
      const username = this.configService.getOrThrow('rabbitmq.username', {
        infer: true,
      });
      const password = this.configService.getOrThrow('rabbitmq.password', {
        infer: true,
      });
      const vhost = this.configService.getOrThrow('rabbitmq.vhost', {
        infer: true,
      });

      const url = `amqp://${username}:${password}@${host}:${port}${vhost}`;

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      const exchange = this.configService.getOrThrow('rabbitmq.exchange', {
        infer: true,
      });
      const queue = this.configService.getOrThrow('rabbitmq.queue', {
        infer: true,
      });
      const routingKey = this.configService.getOrThrow('rabbitmq.routingKey', {
        infer: true,
      });

      // Declare exchange
      await this.channel.assertExchange(exchange, 'direct', { durable: true });

      // Declare queue
      await this.channel.assertQueue(queue, { durable: true });

      // Bind queue to exchange
      await this.channel.bindQueue(queue, exchange, routingKey);

      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  publishLogEntry(logEntry: LogEntry): boolean {
    if (!this.channel) {
      this.logger.warn('RabbitMQ channel is not available');
      return false;
    }

    try {
      const exchange = this.configService.getOrThrow('rabbitmq.exchange', {
        infer: true,
      });
      const routingKey = this.configService.getOrThrow('rabbitmq.routingKey', {
        infer: true,
      });

      const message = JSON.stringify({
        ...logEntry,
        timestamp: logEntry.timestamp.toISOString(),
      });

      const result = this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(message),
        {
          persistent: true,
          timestamp: Date.now(),
        },
      );

      if (!result) {
        this.logger.warn('Failed to publish log entry to RabbitMQ');
      }

      return result;
    } catch (error) {
      this.logger.error('Error publishing log entry to RabbitMQ:', error);
      return false;
    }
  }

  isHealthy(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}
