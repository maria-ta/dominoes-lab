import { DefaultFilter } from './default.filter';
import { ArgumentsHost, HttpException } from '@nestjs/common';

describe('DefaultFilter', () => {
  let filter: DefaultFilter;

  beforeEach(() => {
    filter = new DefaultFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('#catch', () => {
    it('should send a response with proper status code and body', () => {
      const url = 'my/test/url';
      const message = 'Hello world';
      const status = 500;
      const request = { url };
      const response = {} as any;
      response.status = jest.fn().mockReturnValue(response);
      response.json = jest.fn();
      const context = {
        getRequest: () => request,
        getResponse: () => response,
      };
      const host = {
        switchToHttp: () => context,
      } as ArgumentsHost;
      const exception = {
        message,
        getStatus: () => status,
      } as HttpException;

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(status);
      expect(response.json).toHaveBeenCalledWith({
        statusCode: status,
        message,
        path: url,
      });
    });
  });
});
