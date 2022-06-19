import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { WrongArgumentError } from '../models/errors/wrong-argument-error';
import logger from "../utils/logger";

const DEFAULT_ERROR_MESSAGE = 'An error has occurred';

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        this.logError(error);
        if (error instanceof WrongArgumentError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        } else {
          throw new HttpException(
            error?.message || DEFAULT_ERROR_MESSAGE,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }),
    );
  }

  private logError(error: Error): void {
    logger.error(`[Error] ${error.message}`);
    logger.error(error.stack);
  }
}
