import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerService } from './consumer.service';
import { AppGateway } from '../../gateways/app.gateway';

describe('ConsumerService', () => {
  let service: ConsumerService;

  let appGatewayMock;

  beforeEach(async () => {
    appGatewayMock = {
      sendResult: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerService,
        { provide: AppGateway, useValue: appGatewayMock },
      ],
    }).compile();

    service = module.get<ConsumerService>(ConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#onCompleted', () => {
    it('should send result', () => {
      const job = {} as any;
      const result = [['test']];
      service.onCompleted(job, result);

      expect(appGatewayMock.sendResult).toHaveBeenCalledWith(result);
    });
  });
});
