import { registerAs } from '@nestjs/config';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { RabbitMQConfig } from './rabbitmq-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  RABBITMQ_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  RABBITMQ_PORT: number;

  @IsString()
  @IsOptional()
  RABBITMQ_USERNAME: string;

  @IsString()
  @IsOptional()
  RABBITMQ_PASSWORD: string;

  @IsString()
  @IsOptional()
  RABBITMQ_VHOST: string;

  @IsString()
  @IsOptional()
  RABBITMQ_LOGGING_QUEUE: string;

  @IsString()
  @IsOptional()
  RABBITMQ_LOGGING_EXCHANGE: string;

  @IsString()
  @IsOptional()
  RABBITMQ_LOGGING_ROUTING_KEY: string;
}

export default registerAs<RabbitMQConfig>('rabbitmq', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.RABBITMQ_HOST ?? 'localhost',
    port: process.env.RABBITMQ_PORT
      ? parseInt(process.env.RABBITMQ_PORT, 10)
      : 5672,
    username: process.env.RABBITMQ_USERNAME ?? 'guest',
    password: process.env.RABBITMQ_PASSWORD ?? 'guest',
    vhost: process.env.RABBITMQ_VHOST ?? '/',
    queue: process.env.RABBITMQ_LOGGING_QUEUE ?? 'logging_queue',
    exchange: process.env.RABBITMQ_LOGGING_EXCHANGE ?? 'logging_exchange',
    routingKey: process.env.RABBITMQ_LOGGING_ROUTING_KEY ?? 'logging',
  };
});
