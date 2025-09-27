import { registerAs } from '@nestjs/config';

import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { LoggingDatabaseConfig } from './logging-database-config.type';

class EnvironmentVariablesValidator {
  @ValidateIf((envValues) => envValues.LOGGING_DATABASE_URL)
  @IsString()
  LOGGING_DATABASE_URL: string;

  @ValidateIf((envValues) => !envValues.LOGGING_DATABASE_URL)
  @IsString()
  LOGGING_DATABASE_TYPE: string;

  @ValidateIf((envValues) => !envValues.LOGGING_DATABASE_URL)
  @IsString()
  LOGGING_DATABASE_HOST: string;

  @ValidateIf((envValues) => !envValues.LOGGING_DATABASE_URL)
  @IsInt()
  @Min(0)
  @Max(65535)
  LOGGING_DATABASE_PORT: number;

  @ValidateIf((envValues) => !envValues.LOGGING_DATABASE_URL)
  @IsString()
  LOGGING_DATABASE_PASSWORD: string;

  @ValidateIf((envValues) => !envValues.LOGGING_DATABASE_URL)
  @IsString()
  LOGGING_DATABASE_NAME: string;

  @ValidateIf((envValues) => !envValues.LOGGING_DATABASE_URL)
  @IsString()
  LOGGING_DATABASE_USERNAME: string;

  @IsBoolean()
  @IsOptional()
  LOGGING_DATABASE_SYNCHRONIZE: boolean;

  @IsInt()
  @IsOptional()
  LOGGING_DATABASE_MAX_CONNECTIONS: number;

  @IsBoolean()
  @IsOptional()
  LOGGING_DATABASE_SSL_ENABLED: boolean;

  @IsBoolean()
  @IsOptional()
  LOGGING_DATABASE_REJECT_UNAUTHORIZED: boolean;

  @IsString()
  @IsOptional()
  LOGGING_DATABASE_CA: string;

  @IsString()
  @IsOptional()
  LOGGING_DATABASE_KEY: string;

  @IsString()
  @IsOptional()
  LOGGING_DATABASE_CERT: string;
}

export default registerAs<LoggingDatabaseConfig>('loggingDatabase', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    isDocumentDatabase: ['mongodb'].includes(
      process.env.LOGGING_DATABASE_TYPE ?? '',
    ),
    url: process.env.LOGGING_DATABASE_URL,
    type: process.env.LOGGING_DATABASE_TYPE,
    host: process.env.LOGGING_DATABASE_HOST,
    port: process.env.LOGGING_DATABASE_PORT
      ? parseInt(process.env.LOGGING_DATABASE_PORT, 10)
      : 5433,
    password: process.env.LOGGING_DATABASE_PASSWORD,
    name: process.env.LOGGING_DATABASE_NAME,
    username: process.env.LOGGING_DATABASE_USERNAME,
    synchronize: process.env.LOGGING_DATABASE_SYNCHRONIZE === 'true',
    maxConnections: process.env.LOGGING_DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.LOGGING_DATABASE_MAX_CONNECTIONS, 10)
      : 100,
    sslEnabled: process.env.LOGGING_DATABASE_SSL_ENABLED === 'true',
    rejectUnauthorized:
      process.env.LOGGING_DATABASE_REJECT_UNAUTHORIZED === 'true',
    ca: process.env.LOGGING_DATABASE_CA,
    key: process.env.LOGGING_DATABASE_KEY,
    cert: process.env.LOGGING_DATABASE_CERT,
  };
});
