import { Test, TestingModule } from '@nestjs/testing';
import { DominoesService } from './dominoes.service';
import { HelperService } from '../helper/helper.service';

describe('DominoesService', () => {
  let service: DominoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DominoesService, HelperService],
    }).compile();

    service = module.get<DominoesService>(DominoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
