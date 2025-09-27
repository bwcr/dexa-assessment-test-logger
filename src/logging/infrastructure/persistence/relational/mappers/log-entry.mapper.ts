import { LogEntry } from '../../../../domain/log-entry';
import { LogEntryEntity } from '../entities/log-entry.entity';

export class LogEntryMapper {
  static toDomain(raw: LogEntryEntity): LogEntry {
    const domainEntity = new LogEntry({
      id: raw.id,
      level: raw.level,
      message: raw.message,
      context: raw.context ?? undefined,
      method: raw.method ?? undefined,
      url: raw.url ?? undefined,
      userAgent: raw.userAgent ?? undefined,
      ip: raw.ip ?? undefined,
      userId: raw.userId ?? undefined,
      statusCode: raw.statusCode ?? undefined,
      responseTime: raw.responseTime ?? undefined,
      requestId: raw.requestId ?? undefined,
      metadata: raw.metadata ?? undefined,
      timestamp: raw.timestamp,
      createdAt: raw.createdAt,
    });

    return domainEntity;
  }

  static toPersistence(domainEntity: LogEntry): LogEntryEntity {
    const persistenceEntity = new LogEntryEntity();

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.level = domainEntity.level;
    persistenceEntity.message = domainEntity.message;
    persistenceEntity.context = domainEntity.context;
    persistenceEntity.method = domainEntity.method;
    persistenceEntity.url = domainEntity.url;
    persistenceEntity.userAgent = domainEntity.userAgent;
    persistenceEntity.ip = domainEntity.ip;
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.statusCode = domainEntity.statusCode;
    persistenceEntity.responseTime = domainEntity.responseTime;
    persistenceEntity.requestId = domainEntity.requestId;
    persistenceEntity.metadata = domainEntity.metadata;
    persistenceEntity.timestamp = domainEntity.timestamp;
    if (domainEntity.createdAt) {
      persistenceEntity.createdAt = domainEntity.createdAt;
    }

    return persistenceEntity;
  }
}
