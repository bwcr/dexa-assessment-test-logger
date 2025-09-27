import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { LogEntry } from '../../domain/log-entry';

export abstract class LogEntryRepository {
  abstract create(data: LogEntry): Promise<LogEntry>;

  abstract findManyWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<LogEntry[]>;

  abstract findById(id: LogEntry['id']): Promise<NullableType<LogEntry>>;

  abstract findByRequestId(requestId: string): Promise<LogEntry[]>;

  abstract findByUserId(userId: number): Promise<LogEntry[]>;

  abstract findByDateRange(startDate: Date, endDate: Date): Promise<LogEntry[]>;

  abstract remove(id: LogEntry['id']): Promise<void>;
}
