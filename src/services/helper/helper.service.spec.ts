import { Test, TestingModule } from '@nestjs/testing';
import { HelperService } from './helper.service';

describe('HelperService', () => {
  let service: HelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelperService],
    }).compile();

    service = module.get<HelperService>(HelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#createZeroFilledArrayOfLength', () => {
    const length = 5;

    it('should return an array of specified length', () => {
      const result = service.createZeroFilledArrayOfLength(length);

      expect(result.length).toEqual(length);
    });

    it('should return an array filled with 0', () => {
      const result = service.createZeroFilledArrayOfLength(length);

      expect(result.every((i) => i === 0)).toBe(true);
    });
  });
});
