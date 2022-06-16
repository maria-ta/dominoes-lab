import { ErrorHandlingInterceptor } from './error-handling.interceptor';

describe('ErrorHandlingInterceptor', () => {
  it('should be defined', () => {
    expect(new ErrorHandlingInterceptor()).toBeDefined();
  });
});
