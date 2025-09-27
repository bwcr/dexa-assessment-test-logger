import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class LoggingTypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get('loggingDatabase.type', { infer: true }),
      url: this.configService.get('loggingDatabase.url', { infer: true }),
      host: this.configService.get('loggingDatabase.host', { infer: true }),
      port: this.configService.get('loggingDatabase.port', { infer: true }),
      username: this.configService.get('loggingDatabase.username', {
        infer: true,
      }),
      password: this.configService.get('loggingDatabase.password', {
        infer: true,
      }),
      database: this.configService.get('loggingDatabase.name', { infer: true }),
      synchronize: this.configService.get('loggingDatabase.synchronize', {
        infer: true,
      }),
      dropSchema: false,
      keepConnectionAlive: true,
      logging:
        this.configService.get('app.nodeEnv', { infer: true }) !== 'production',
      entities: [
        __dirname +
          '/infrastructure/persistence/relational/entities/*.entity{.ts,.js}',
      ],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      cli: {
        entitiesDir: 'src/logging',
        migrationsDir: 'src/logging/migrations',
      },
      extra: {
        // based on https://node-postgres.com/apis/pool
        // max connection pool size
        max: this.configService.get('loggingDatabase.maxConnections', {
          infer: true,
        }),
        ssl: this.configService.get('loggingDatabase.sslEnabled', {
          infer: true,
        })
          ? {
              rejectUnauthorized: this.configService.get(
                'loggingDatabase.rejectUnauthorized',
                { infer: true },
              ),
              ca:
                this.configService.get('loggingDatabase.ca', { infer: true }) ??
                undefined,
              key:
                this.configService.get('loggingDatabase.key', {
                  infer: true,
                }) ?? undefined,
              cert:
                this.configService.get('loggingDatabase.cert', {
                  infer: true,
                }) ?? undefined,
            }
          : undefined,
      },
    } as TypeOrmModuleOptions;
  }
}
