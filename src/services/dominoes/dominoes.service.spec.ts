import { Test, TestingModule } from '@nestjs/testing';
import { DominoesService } from './dominoes.service';

describe('DominoesService', () => {
  let service: DominoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DominoesService],
    }).compile();

    service = module.get<DominoesService>(DominoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
