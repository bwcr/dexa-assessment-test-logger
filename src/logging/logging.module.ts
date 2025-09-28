import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { LoggingController } from './logging.controller';
import { LoggingInterceptor } from './logging.interceptor';
import { RabbitMQProducerService } from './rabbitmq-producer.service';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service';
import { RelationalLogEntryPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalLogEntryPersistenceModule],
  controllers: [LoggingController],
  providers: [
    LoggingService,
    LoggingInterceptor,
    RabbitMQProducerService,
    RabbitMQConsumerService,
  ],
  exports: [
    LoggingService,
    LoggingInterceptor,
    RabbitMQProducerService,
    RabbitMQConsumerService,
  ],
})
export class LoggingModule {}
