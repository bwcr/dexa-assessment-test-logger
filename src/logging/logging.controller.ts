import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggingService } from './logging.service';
import { LogEntryRepository } from './infrastructure/persistence/log-entry.repository';
import { LogLevel } from './domain/log-level.enum';

@ApiTags('Logging')
@Controller({
  path: 'logging',
  version: '1',
})
export class LoggingController {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly logEntryRepository: LogEntryRepository,
  ) {}

  @Post('test')
  @ApiOperation({ summary: 'Test logging functionality' })
  @ApiResponse({ status: 201, description: 'Log entry created successfully' })
  async testLogging(@Body() body: { message: string; level?: LogLevel }) {
    const { message, level = LogLevel.INFO } = body;

    switch (level) {
      case LogLevel.ERROR:
        await this.loggingService.logError(message, 'TEST_CONTROLLER');
        break;
      case LogLevel.WARN:
        await this.loggingService.logWarn(message, 'TEST_CONTROLLER');
        break;
      case LogLevel.DEBUG:
        await this.loggingService.logDebug(message, 'TEST_CONTROLLER');
        break;
      default:
        await this.loggingService.logInfo(message, 'TEST_CONTROLLER');
    }

    return {
      message: 'Log entry queued successfully',
      level,
      content: message,
    };
  }

  @Get('entries')
  @ApiOperation({ summary: 'Get log entries with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Log entries retrieved successfully',
  })
  async getLogEntries(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const paginationOptions = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const entries = await this.logEntryRepository.findManyWithPagination({
      paginationOptions,
    });

    return {
      data: entries,
      pagination: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        total: entries.length,
      },
    };
  }

  @Get('entries/request/:requestId')
  @ApiOperation({ summary: 'Get log entries by request ID' })
  @ApiResponse({
    status: 200,
    description: 'Log entries retrieved successfully',
  })
  async getLogEntriesByRequestId(@Param('requestId') requestId: string) {
    const entries = await this.logEntryRepository.findByRequestId(requestId);

    return {
      data: entries,
      requestId,
      total: entries.length,
    };
  }

  @Get('entries/user/:userId')
  @ApiOperation({ summary: 'Get log entries by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Log entries retrieved successfully',
  })
  async getLogEntriesByUserId(@Param('userId') userId: string) {
    const entries = await this.logEntryRepository.findByUserId(
      parseInt(userId, 10),
    );

    return {
      data: entries,
      userId: parseInt(userId, 10),
      total: entries.length,
    };
  }

  @Get('entries/date-range')
  @ApiOperation({ summary: 'Get log entries by date range' })
  @ApiResponse({
    status: 200,
    description: 'Log entries retrieved successfully',
  })
  async getLogEntriesByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const entries = await this.logEntryRepository.findByDateRange(start, end);

    return {
      data: entries,
      dateRange: { startDate: start, endDate: end },
      total: entries.length,
    };
  }
}
