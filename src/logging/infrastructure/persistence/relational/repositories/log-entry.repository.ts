import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { LogEntryEntity } from '../entities/log-entry.entity';
import { LogEntry } from '../../../../domain/log-entry';
import { LogEntryRepository } from '../../log-entry.repository';
import { LogEntryMapper } from '../mappers/log-entry.mapper';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class LogEntriesRelationalRepository implements LogEntryRepository {
  constructor(
    @InjectRepository(LogEntryEntity)
    private readonly logEntryRepository: Repository<LogEntryEntity>,
  ) {}

  async create(data: LogEntry): Promise<LogEntry> {
    const persistenceModel = LogEntryMapper.toPersistence(data);
    const newEntity = await this.logEntryRepository.save(
      this.logEntryRepository.create(persistenceModel),
    );
    return LogEntryMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<LogEntry[]> {
    const entities = await this.logEntryRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: { createdAt: 'DESC' },
    });

    return entities.map((logEntry) => LogEntryMapper.toDomain(logEntry));
  }

  async findById(id: LogEntry['id']): Promise<NullableType<LogEntry>> {
    const entity = await this.logEntryRepository.findOne({
      where: { id: Number(id) },
    });

    return entity ? LogEntryMapper.toDomain(entity) : null;
  }

  async findByRequestId(requestId: string): Promise<LogEntry[]> {
    const entities = await this.logEntryRepository.find({
      where: { requestId },
      order: { createdAt: 'ASC' },
    });

    return entities.map((logEntry) => LogEntryMapper.toDomain(logEntry));
  }

  async findByUserId(userId: number): Promise<LogEntry[]> {
    const entities = await this.logEntryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return entities.map((logEntry) => LogEntryMapper.toDomain(logEntry));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<LogEntry[]> {
    const entities = await this.logEntryRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'ASC' },
    });

    return entities.map((logEntry) => LogEntryMapper.toDomain(logEntry));
  }

  async remove(id: LogEntry['id']): Promise<void> {
    if (id) {
      await this.logEntryRepository.delete(id);
    }
  }
}
