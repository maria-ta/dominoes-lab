import { Injectable } from '@nestjs/common';
import { WrongArgumentError } from '../../models/errors/wrong-argument-error';
import TABLE_CONSTANTS from '../../constants/table.const';

@Injectable()
export class TableValidatorService {
  checkTable(initialTable: number[][]): void {
    if (this.isOfIncorrectSize(initialTable)) {
      throw new WrongArgumentError('Incorrect size of initial table');
    } else if (this.hasSomeInvalidCells(initialTable)) {
      throw new WrongArgumentError('Invalid cell(s) in initial table');
    }
  }

  private isOfIncorrectSize(initialTable: number[][]): boolean {
    return (
      initialTable.length > TABLE_CONSTANTS.height ||
      initialTable.some((row) => row.length !== TABLE_CONSTANTS.width)
    );
  }

  private hasSomeInvalidCells(initialTable: number[][]): boolean {
    return initialTable.some((row) =>
      row.some(
        (cell) =>
          typeof cell !== 'number' ||
          cell < TABLE_CONSTANTS.minCellValue ||
          cell > TABLE_CONSTANTS.maxCellValue,
      ),
    );
  }
}
