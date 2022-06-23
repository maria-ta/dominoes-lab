import { AppGateway } from './app.gateway';

describe('AppGateway', () => {
  let gateway: AppGateway;

  let serverMock;

  beforeEach(async () => {
    serverMock = {
      emit: jest.fn(),
    };
    gateway = new AppGateway();
    gateway.server = serverMock;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('#sendResult', () => {
    it('should emit result', () => {
      const result = [['test']];

      gateway.sendResult(result);

      expect(serverMock.emit).toHaveBeenCalledWith('result', result);
    });
  });
});
