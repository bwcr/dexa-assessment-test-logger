import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LogLevel } from '../../../../domain/log-level.enum';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'log_entry',
})
export class LogEntryEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({
    type: 'enum',
    enum: LogLevel,
  })
  level: LogLevel;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: String, nullable: true })
  context?: string | null;

  @Column({ type: String, nullable: true })
  method?: string | null;

  @Column({ type: String, nullable: true })
  url?: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent?: string | null;

  @Column({ type: String, nullable: true })
  ip?: string | null;

  @Index()
  @Column({ type: Number, nullable: true })
  userId?: number | null;

  @Column({ type: Number, nullable: true })
  statusCode?: number | null;

  @Column({ type: Number, nullable: true })
  responseTime?: number | null;

  @Index()
  @Column({ type: String, nullable: true })
  requestId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @Index()
  @Column()
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}
