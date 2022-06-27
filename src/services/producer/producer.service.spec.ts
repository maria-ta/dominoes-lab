import { ProducerService } from './producer.service';
import { InitialTableDto } from '../../dto/initial-table.dto';

describe('AppService', () => {
  let service: ProducerService;

  let queueMock;

  beforeEach(async () => {
    queueMock = {
      add: jest.fn(),
    } as any;

    service = new ProducerService(queueMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#solve', () => {
    it('should add problem to queue', async () => {
      const initialTableDto: InitialTableDto = {
        initialTable: [[1]],
      };

      await service.solve(initialTableDto);

      expect(queueMock.add).toHaveBeenCalledWith(initialTableDto);
    });
  });
});
