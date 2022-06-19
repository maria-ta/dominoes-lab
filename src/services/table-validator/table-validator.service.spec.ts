import { Test, TestingModule } from '@nestjs/testing';
import { TableValidatorService } from './table-validator.service';
import { HelperService } from '../helper/helper.service';
import { WrongArgumentError } from '../../models/errors/wrong-argument-error';
import TABLE_CONSTANTS from '../../constants/table.const';

describe('TableValidatorService', () => {
  let service: TableValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TableValidatorService, HelperService],
    }).compile();

    service = module.get<TableValidatorService>(TableValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#checkTable', () => {
    it('should throw an error if table is of incorrect height', () => {
      const initialTable = [];

      try {
        service.checkTable(initialTable);
      } catch (e) {
        expect(e).toBeInstanceOf(WrongArgumentError);
        expect(e.message).toEqual('Incorrect size of initial table');
      }
    });

    it('should throw an error if table is of incorrect width', () => {
      const initialTable = [
        [1],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],

        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ];

      try {
        service.checkTable(initialTable);
      } catch (e) {
        expect(e).toBeInstanceOf(WrongArgumentError);
        expect(e.message).toEqual('Incorrect size of initial table');
      }
    });

    it('should throw an error if table has at least one cell not of type number', () => {
      const initialTable = [
        [4, 6, 2, 5, 5, 2, 0, 1],
        [0, 4, 4, 0, 0, 1, 6, 3],
        [2, 4, 4, 1, 1, 3, 1, 5],

        [2, 5, 0, 'test', 2, 2, 0, 0],

        [5, 3, 3, 6, 4, 1, 3, 5],
        [1, 4, 1, 4, 5, 6, 6, 5],
        [6, 6, 3, 0, 3, 3, 6, 2],
      ] as any;

      try {
        service.checkTable(initialTable);
      } catch (e) {
        expect(e).toBeInstanceOf(WrongArgumentError);
        expect(e.message).toEqual('Invalid cell(s) in initial table');
      }
    });

    it('should throw an error if table has at least one cell with value less than expected value', () => {
      const incorrectValue = TABLE_CONSTANTS.minCellValue - 1;
      const initialTable = [
        [4, 6, 2, 5, 5, 2, 0, 1],
        [0, 4, 4, 0, 0, 1, 6, 3],
        [2, 4, 4, 1, 1, 3, 1, 5],

        [2, 5, 0, incorrectValue, 2, 2, 0, 0],

        [5, 3, 3, 6, 4, 1, 3, 5],
        [1, 4, 1, 4, 5, 6, 6, 5],
        [6, 6, 3, 0, 3, 3, 6, 2],
      ];

      try {
        service.checkTable(initialTable);
      } catch (e) {
        expect(e).toBeInstanceOf(WrongArgumentError);
        expect(e.message).toEqual('Invalid cell(s) in initial table');
      }
    });

    it('should throw an error if table has at least one cell with value greater than expected value', () => {
      const incorrectValue = TABLE_CONSTANTS.maxCellValue + 1;
      const initialTable = [
        [4, 6, 2, 5, 5, 2, 0, 1],
        [0, 4, 4, 0, 0, 1, 6, 3],
        [2, 4, 4, 1, 1, 3, 1, 5],

        [2, 5, 0, incorrectValue, 2, 2, 0, 0],

        [5, 3, 3, 6, 4, 1, 3, 5],
        [1, 4, 1, 4, 5, 6, 6, 5],
        [6, 6, 3, 0, 3, 3, 6, 2],
      ];

      try {
        service.checkTable(initialTable);
      } catch (e) {
        expect(e).toBeInstanceOf(WrongArgumentError);
        expect(e.message).toEqual('Invalid cell(s) in initial table');
      }
    });

    it('should throw an error if table has an invalid number of different values', () => {
      const initialTable = [
        [4, 0, 0, 0, 0, 0, 0, 0],
        [0, 4, 4, 0, 0, 1, 6, 3],
        [2, 4, 4, 1, 1, 3, 1, 5],

        [2, 5, 0, 2, 2, 2, 0, 0],

        [5, 3, 3, 6, 4, 1, 3, 5],
        [1, 4, 1, 4, 5, 6, 6, 5],
        [6, 6, 3, 0, 3, 3, 6, 2],
      ];

      try {
        service.checkTable(initialTable);
      } catch (e) {
        expect(e).toBeInstanceOf(WrongArgumentError);
        expect(e.message).toEqual(
          'Invalid number of values occurrence. No solution available',
        );
      }
    });

    it('should not throw an error if table is valid', () => {
      const initialTable = [
        [4, 6, 2, 5, 5, 2, 0, 1],
        [0, 4, 4, 0, 0, 1, 6, 3],
        [2, 4, 4, 1, 1, 3, 1, 5],

        [2, 5, 0, 2, 2, 2, 0, 0],

        [5, 3, 3, 6, 4, 1, 3, 5],
        [1, 4, 1, 4, 5, 6, 6, 5],
        [6, 6, 3, 0, 3, 3, 6, 2],
      ];

      try {
        service.checkTable(initialTable);
        expect(true).toBe(true);
      } catch (e) {}
    });
  });
});
