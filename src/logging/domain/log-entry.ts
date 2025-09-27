import { LogLevel } from './log-level.enum';

export class LogEntry {
  id?: number;
  level: LogLevel;
  message: string;
  context?: string;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  userId?: number;
  statusCode?: number;
  responseTime?: number;
  requestId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt?: Date;

  constructor(data: Partial<LogEntry>) {
    Object.assign(this, data);
    this.timestamp = data.timestamp || new Date();
  }
}
