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
import { LogEntryRepository } from './infrastructure/persistence/log-entry.repository';

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConsumerService.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly logEntryRepository: LogEntryRepository,
  ) {}

  async onModuleInit() {
    await this.connect();
    await this.setupConsumer();
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

      // Set prefetch to process one message at a time
      await this.channel.prefetch(1);

      this.logger.log('Successfully connected to RabbitMQ consumer');
    } catch (error) {
      this.logger.error('Failed to connect RabbitMQ consumer:', error);
      throw error;
    }
  }

  private async setupConsumer(): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not available');
    }

    try {
      const queue = this.configService.getOrThrow('rabbitmq.queue', {
        infer: true,
      });

      await this.channel.consume(
        queue,
        async (message) => {
          if (message) {
            try {
              await this.processLogMessage(message);
              this.channel?.ack(message);
            } catch (error) {
              this.logger.error('Error processing log message:', error);
              // Reject and requeue the message for retry
              this.channel?.nack(message, false, true);
            }
          }
        },
        {
          noAck: false, // Enable manual acknowledgment
        },
      );

      this.logger.log('RabbitMQ consumer is ready to process messages');
    } catch (error) {
      this.logger.error('Failed to setup RabbitMQ consumer:', error);
      throw error;
    }
  }

  private async processLogMessage(message: amqp.ConsumeMessage): Promise<void> {
    try {
      const messageContent = message.content.toString();
      const logData = JSON.parse(messageContent);

      // Convert timestamp back to Date object
      if (logData.timestamp) {
        logData.timestamp = new Date(logData.timestamp);
      }

      // Create LogEntry domain object
      const logEntry = new LogEntry(logData);

      // Save to database
      await this.logEntryRepository.create(logEntry);

      this.logger.debug(
        `Processed log entry: ${logEntry.level} - ${logEntry.message}`,
      );
    } catch (error) {
      this.logger.error('Error processing log message:', error);
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
      this.logger.log('Disconnected RabbitMQ consumer');
    } catch (error) {
      this.logger.error('Error disconnecting RabbitMQ consumer:', error);
    }
  }

  isHealthy(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}
