import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModuleOptions } from './configs/module-options';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AppLoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string | undefined>(
          'database.url',
        );
        const databaseHost = configService.get<string | undefined>(
          'database.host',
        );
        const shouldUseSsl =
          Boolean(databaseUrl) || Boolean(databaseHost?.includes('neon.tech'));

        const commonOptions = {
          type: 'postgres' as const,
          entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
          autoLoadEntities: true,
          // Timezone configured on the Postgres server.
          // This is used to typecast server date/time values to JavaScript Date object and vice versa.
          timezone: 'Z',
          synchronize: true,
          debug: configService.get<string>('env') === 'development',
        };

        if (databaseUrl) {
          return {
            ...commonOptions,
            url: databaseUrl,
          };
        }

        return {
          ...commonOptions,
          host: configService.get<string>('database.host'),
          port: configService.get<number | undefined>('database.port'),
          database: configService.get<string>('database.name'),
          username: configService.get<string>('database.user'),
          password: configService.get<string>('database.pass'),
        };
      },
    }),
    AppLoggerModule,
  ],
  exports: [AppLoggerModule, ConfigModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },

    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class SharedModule {}
