import { Module } from '@nestjs/common';
import { LogEntryRepository } from '../log-entry.repository';
import { LogEntriesRelationalRepository } from './repositories/log-entry.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntryEntity } from './entities/log-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntryEntity])],
  providers: [
    {
      provide: LogEntryRepository,
      useClass: LogEntriesRelationalRepository,
    },
  ],
  exports: [LogEntryRepository],
})
export class RelationalLogEntryPersistenceModule {}
