import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/** Postgres unique_violation. */
const PG_UNIQUE_VIOLATION = '23505';

interface DriverError {
  code?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * A unique-constraint breach is a client conflict, not a server fault. The
   * driver message names the internal index, so it is logged but never sent.
   */
  private isUniqueViolation(exception: unknown): boolean {
    if (!(exception instanceof QueryFailedError)) {
      return false;
    }

    const driverError = exception.driverError as DriverError | undefined;
    return driverError?.code === PG_UNIQUE_VIOLATION;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      message =
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message || message
          : exceptionResponse;
    } else if (this.isUniqueViolation(exception)) {
      status = HttpStatus.CONFLICT;
      message = 'A record with these details already exists';
      this.logger.error(
        `Unique violation on ${request.url}: ${(exception as Error).message}`,
      );
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
    );

    response.status(status).json(errorResponse);
  }
}
