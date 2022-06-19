import { ErrorHandlingInterceptor } from './error-handling.interceptor';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { catchError, of, throwError } from 'rxjs';
import { WrongArgumentError } from '../models/errors/wrong-argument-error';

describe('ErrorHandlingInterceptor', () => {
  let interceptor: ErrorHandlingInterceptor;

  beforeEach(() => {
    interceptor = new ErrorHandlingInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('#intercept', () => {
    const context = {} as ExecutionContext;
    const message = 'Hello world';
    const defaultMessage = 'An error has occurred';

    it('should throw HttpException with HttpStatus.BAD_REQUEST when error is instance of WrongArgumentError', () => {
      const error = new WrongArgumentError(message);
      const handle = throwError(error);
      const next = {
        handle: jest.fn().mockReturnValue(handle),
      };

      interceptor
        .intercept(context, next)
        .pipe(
          catchError((error: HttpException) => {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.getStatus()).toEqual(HttpStatus.BAD_REQUEST);
            expect(error.message).toEqual(message);
            return of({});
          }),
        )
        .subscribe();
    });

    it('should throw HttpException with HttpStatus.INTERNAL_SERVER_ERROR when error is not instance of WrongArgumentError', () => {
      const error = new Error(message);
      const handle = throwError(error);
      const next = {
        handle: jest.fn().mockReturnValue(handle),
      };

      interceptor
        .intercept(context, next)
        .pipe(
          catchError((error: HttpException) => {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.getStatus()).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(error.message).toEqual(message);
            return of({});
          }),
        )
        .subscribe();
    });

    it('should throw HttpException with default message when no error message provided', () => {
      const error = new Error();
      const handle = throwError(error);
      const next = {
        handle: jest.fn().mockReturnValue(handle),
      };

      interceptor
        .intercept(context, next)
        .pipe(
          catchError((error: HttpException) => {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.getStatus()).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(error.message).toEqual(defaultMessage);
            return of({});
          }),
        )
        .subscribe();
    });
  });
});
