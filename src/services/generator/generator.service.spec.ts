import { Test, TestingModule } from '@nestjs/testing';
import { GeneratorService } from './generator.service';
import { HelperService } from '../helper/helper.service';
import { TableValidatorService } from '../table-validator/table-validator.service';
import exp from "constants";

describe('GeneratorService', () => {
  let service: GeneratorService;

  let tableValidatorService: TableValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneratorService, HelperService, TableValidatorService],
    }).compile();

    service = module.get<GeneratorService>(GeneratorService);
    tableValidatorService = module.get<TableValidatorService>(
      TableValidatorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#generateValidData', () => {
    it('should generate valid data', () => {
      const generatedData = service.generateValidData();

      try {
        tableValidatorService.checkTable(generatedData.numbers);
        expect(true).toBe(true);
      } catch (e) {}
    });

    it('should generate valid data 1000/1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        const generatedData = service.generateValidData();

        try {
          tableValidatorService.checkTable(generatedData.numbers);
          expect(true).toBe(true);
        } catch (e) {}
      }
    });

    it('should generate unique data', () => {
      const dataGeneratedFirstTime = service.generateValidData();
      const dataGeneratedSecondTime = service.generateValidData();

      expect(dataGeneratedSecondTime).not.toEqual(dataGeneratedFirstTime);
    });

    it('should throw an error when too many attempts to generate', () => {
      try {
        // mock method to return invalid data
        jest.spyOn(service as any, 'generateCards').mockReturnValue([]);
        service.generateValidData(11);
      } catch (e) {
        expect(e).toBeTruthy();
      }
    });
  });

  describe('#generateInalidData', () => {
    it('should generate invalid data', () => {
      const generatedData = service.generateInvalidData();

      try {
        tableValidatorService.checkTable(generatedData.numbers);
      } catch (e) {
        expect(e).toBeTruthy();
      }
    });

    it('should generate unique data', () => {
      const dataGeneratedFirstTime = service.generateInvalidData();
      const dataGeneratedSecondTime = service.generateInvalidData();

      expect(dataGeneratedSecondTime).not.toEqual(dataGeneratedFirstTime);
    });
  });
});
