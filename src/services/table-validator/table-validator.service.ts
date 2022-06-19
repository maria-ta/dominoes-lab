import { Injectable } from '@nestjs/common';
import { WrongArgumentError } from '../../models/errors/wrong-argument-error';
import TABLE_CONSTANTS from '../../constants/table.const';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class TableValidatorService {
  constructor(private readonly helperService: HelperService) {}

  checkTable(initialTable: number[][]): void {
    if (this.isOfIncorrectSize(initialTable)) {
      throw new WrongArgumentError('Incorrect size of initial table');
    } else if (this.hasSomeInvalidCells(initialTable)) {
      throw new WrongArgumentError('Invalid cell(s) in initial table');
    } else if (this.hasAnInvalidNumberOfValuesOccurrence(initialTable)) {
      throw new WrongArgumentError(
        'Invalid number of values occurrence. No solution available',
      );
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

  private hasAnInvalidNumberOfValuesOccurrence(
    initialTable: number[][],
  ): boolean {
    const numberOfDifferentValues =
      TABLE_CONSTANTS.maxCellValue - TABLE_CONSTANTS.minCellValue + 1;
    const numbersOfValuesOccurrence =
      this.helperService.createZeroFilledArrayOfLength(numberOfDifferentValues);

    initialTable.forEach((row) => {
      row.forEach((cell) => {
        numbersOfValuesOccurrence[cell - TABLE_CONSTANTS.minCellValue] += 1;
      });
    });

    return numbersOfValuesOccurrence.some(
      (valueQuantity) =>
        valueQuantity !== TABLE_CONSTANTS.numberOfEachValueOccurrence,
    );
  }
}
