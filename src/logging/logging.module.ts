import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingService } from './logging.service';
import { LoggingController } from './logging.controller';
import { LoggingInterceptor } from './logging.interceptor';
import { RabbitMQProducerService } from './rabbitmq-producer.service';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service';
import { LoggingTypeOrmConfigService } from './logging-typeorm-config.service';
import { RelationalLogEntryPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { DataSource, DataSourceOptions } from 'typeorm';

const infrastructureLoggingDatabaseModule = TypeOrmModule.forRootAsync({
  name: 'loggingConnection',
  useClass: LoggingTypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions) => {
    return new DataSource(options).initialize();
  },
});

@Module({
  imports: [
    infrastructureLoggingDatabaseModule,
    RelationalLogEntryPersistenceModule,
  ],
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
