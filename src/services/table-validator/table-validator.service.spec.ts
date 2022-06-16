import { Test, TestingModule } from '@nestjs/testing';
import { TableValidatorService } from './table-validator.service';

describe('TableValidatorService', () => {
  let service: TableValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TableValidatorService],
    }).compile();

    service = module.get<TableValidatorService>(TableValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
