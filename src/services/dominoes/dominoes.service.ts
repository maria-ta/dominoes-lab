import { Injectable } from '@nestjs/common';
import { HelperService } from '../helper/helper.service';
import { Cell } from '../../interfaces/cell';
import { Guess } from '../../interfaces/guess';
import TABLE_CONSTANTS from '../../constants/table.const';

@Injectable()
export class DominoesService {
  initialTable: number[][];
  result: string[][];
  availabilityTable: Cell[][];
  takenCardsTable: number[][];

  guessingStack: Guess[];

  anyCellWasChanged = false;

  constructor(private readonly helperService: HelperService) {}

  solveProblem(initialTable: number[][]): string[][] {
    this.setup(initialTable);
    let counter = 0;

    do {
      this.availabilityTable = this.createAvailabilityTable();
      this.anyCellWasChanged = false;

      initialTable.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (!this.result[i][j]) {
            this.checkCell(i, j);
          }
        });
      });
      this.availabilityTable.forEach((row, a) => {
        row.forEach((cell, b) => {
          const wasCardTaken =
            this.takenCardsTable[Math.min(a, b)][Math.max(a, b)] > 0;
          if (
            cell.quantity === 1 &&
            !wasCardTaken &&
            !this.wasPlaceByCoordinatesTaken(cell.coordinates[0])
          ) {
            this.updateResultWithCoordinates([[a, b], ...cell.coordinates[0]]);
            this.anyCellWasChanged = true;
          }
        });
      });

      const noCellWasChanged = !this.anyCellWasChanged;
      if (noCellWasChanged) {
        if (this.isProblemSolved()) {
          return this.result;
        } else {
          this.guess();
        }
      }
      counter++;
    } while (this.anyCellWasChanged && counter < 100);

    return this.result;
  }

  /**
   * Adds coordinates of `card` to `availability table`.
   * @param card in format [number, number]
   * @param coordinates1 in format [number, number]
   * @param coordinates2 in format [number, number]
   */
  updateAvailabilityOfCard(
    [a, b]: number[],
    [i, j]: number[],
    [x, y]: number[],
  ): void {
    const card = this.availabilityTable[Math.min(a, b)][Math.max(a, b)];
    card.quantity += 1;
    if (x > i || y > j) {
      card.coordinates.push([
        [i, j],
        [x, y],
      ]);
    } else {
      card.coordinates.push([
        [x, y],
        [i, j],
      ]);
    }
  }

  /**
   * Updates result table with card data
   * @param card [card, cardCoordinates1, cardCoordinates2]
   */
  updateResultWithCoordinates([[a, b], [x, y], [i, j]]: number[][]) {
    if (this.result[x][y] || this.result[i][j]) {
      throw new Error(
        `The place is taken already! ${a}-${b} [${x}, ${y}], [${i}, ${j}]. It's ${this.result[x][y]} and ${this.result[i][j]}`,
      );
    }
    if (this.takenCardsTable[Math.min(a, b)][Math.max(a, b)] > 0) {
      throw new Error(
        `The card is taken already! ${a}-${b} [${x}, ${y}], [${i}, ${j}].`,
      );
    }
    if (x !== i) {
      //t, b
      if (x > i) {
        this.result[x][y] = 'b';
        this.result[i][j] = 't';
      } else {
        this.result[x][y] = 't';
        this.result[i][j] = 'b';
      }
    } else {
      //l, r
      if (y > j) {
        this.result[x][y] = 'r';
        this.result[i][j] = 'l';
      } else {
        this.result[x][y] = 'l';
        this.result[i][j] = 'r';
      }
    }
    this.takenCardsTable[Math.min(a, b)][Math.max(a, b)] = 1;
  }

  /**
   *
   * @returns an array filled with default values for an `availabilityTable`: `{quantity: 0, coordinates: []}`
   */
  createAvailabilityTable(): Cell[][] {
    return this.helperService
      .createZeroFilledArrayOfLength(
        TABLE_CONSTANTS.maxCellValue - TABLE_CONSTANTS.minCellValue,
      )
      .map(() =>
        this.helperService
          .createZeroFilledArrayOfLength(
            TABLE_CONSTANTS.maxCellValue - TABLE_CONSTANTS.minCellValue,
          )
          .map(() => ({
            quantity: 0,
            coordinates: [],
          })),
      );
  }

  /**
   * @returns false when there is an empty cell in result, else returns true
   */
  isProblemSolved(): boolean {
    for (let i = 0; i < this.result.length; i++) {
      for (let j = 0; j < this.result.length; j++) {
        if (!this.result[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * @param coordinates [[x, y], [i, j]]
   * @returns true when result cell on [x, y] or [i, j] is not empty
   */
  wasPlaceByCoordinatesTaken(coordinates: number[][]): boolean {
    const [[x, y], [i, j]] = coordinates;
    return !!this.result[x][y] || !!this.result[i][j];
  }

  /**
   *
   * @param i
   * @param j
   */
  checkCell(i: number, j: number): void {
    const row = this.initialTable[i];
    const cell = row[j];
    // [[a,b], [i,j], [x,y]]
    const allVariants: number[][][] = [];
    let lastVariant: number[][] = [];
    let numberOfPossibleVariants = 0;
    if (j + 1 < row.length && !this.result[i][j + 1]) {
      const variant = [
        [cell, this.initialTable[i][j + 1]],
        [i, j],
        [i, j + 1],
      ];
      if (this.initialTable[i][j + 1] >= cell) {
        allVariants.push(variant);
      }
      lastVariant = variant;
      numberOfPossibleVariants += 1;
    }
    if (i + 1 < this.initialTable.length && !this.result[i + 1][j]) {
      const variant = [
        [cell, this.initialTable[i + 1][j]],
        [i, j],
        [i + 1, j],
      ];
      if (this.initialTable[i + 1][j] >= cell) {
        allVariants.push(variant);
      }
      lastVariant = variant;
      numberOfPossibleVariants += 1;
    }
    if (j - 1 >= 0 && !this.result[i][j - 1]) {
      const variant = [
        [cell, this.initialTable[i][j - 1]],
        [i, j],
        [i, j - 1],
      ];
      if (this.initialTable[i][j - 1] >= cell) {
        allVariants.push(variant);
      }
      lastVariant = variant;
      numberOfPossibleVariants += 1;
    }
    if (i - 1 >= 0 && !this.result[i - 1][j]) {
      const variant = [
        [cell, this.initialTable[i - 1][j]],
        [i, j],
        [i - 1, j],
      ];
      if (this.initialTable[i - 1][j] >= cell) {
        allVariants.push(variant);
      }
      lastVariant = variant;
      numberOfPossibleVariants += 1;
    }

    if (numberOfPossibleVariants === 1) {
      try {
        this.updateResultWithCoordinates(lastVariant);
        this.anyCellWasChanged = true;
      } catch (e) {
        console.error('Here we go');
      }
    } else {
      allVariants.forEach(([ab, ij, xy]) => {
        this.updateAvailabilityOfCard(ab, ij, xy);
      });
    }
  }

  guess(except?) {
    const { ab, cell } = this.findFirstWithMoreThanOnePossibleVariants(except);
    const [a, b] = ab;
    if (cell) {
      this.updateGuessingStack([a, b], cell);
      this.updateResultWithCoordinates([[a, b], ...cell.coordinates[0]]);
      this.anyCellWasChanged = true;
    } else {
      this.revert();
    }
  }

  revert() {
    if (this.guessingStack.length) {
      const previousGuess = this.guessingStack.pop();
      const nextCoordinates = previousGuess.nextGuesses;

      this.result = JSON.parse(previousGuess.result);
      this.takenCardsTable = JSON.parse(previousGuess.takenCardsTable);
      this.availabilityTable = JSON.parse(previousGuess.availabilityTable);

      this.updateResultWithCoordinates([
        previousGuess.ab,
        ...nextCoordinates[0],
      ]);

      nextCoordinates.splice(0, 1);

      if (nextCoordinates.length) {
        const guessingStackItem: Guess = {
          ab: previousGuess.ab,
          result: JSON.stringify(this.result),
          takenCardsTable: JSON.stringify(this.takenCardsTable),
          availabilityTable: JSON.stringify(this.availabilityTable),
          nextGuesses: nextCoordinates,
          except: previousGuess.except,
        };
        this.guessingStack.push(guessingStackItem);
      } else {
        const [a, b] = previousGuess.ab;
        previousGuess.except.push(`${Math.min(a, b)}${Math.max(a, b)}`);
        this.guess(previousGuess.except);
      }
    } else {
      console.log('You have no choice :(');
    }
  }

  updateGuessingStack([a, b], cell) {
    const cellCoordinatesCopy = JSON.parse(JSON.stringify(cell.coordinates));
    cellCoordinatesCopy.splice(0, 1);
    const guessingStackItem: Guess = {
      ab: [a, b],
      result: JSON.stringify(this.result),
      takenCardsTable: JSON.stringify(this.takenCardsTable),
      availabilityTable: JSON.stringify(this.availabilityTable),
      nextGuesses: cellCoordinatesCopy,
      except: [],
    };
    this.guessingStack.push(guessingStackItem);
  }

  findFirstWithMoreThanOnePossibleVariants(except): {
    ab: number[];
    cell: Cell;
  } {
    except = except || [];
    for (let n = 2; n < 100; n++) {
      for (let a = 0; a < this.availabilityTable.length; a++) {
        const row = this.availabilityTable[a];
        for (let b = 0; b < row.length; b++) {
          const cell = row[b];
          const wasCardTaken =
            this.takenCardsTable[Math.min(a, b)][Math.max(a, b)] > 0;
          const shouldNotSkipThisCell = !(
            except.includes(`${a}${b}`) || except.includes(`${b}${a}`)
          );
          if (cell.quantity === n && !wasCardTaken && shouldNotSkipThisCell) {
            return {
              ab: [a, b],
              cell: cell,
            };
          }
        }
      }
    }
    return {
      ab: [null, null],
      cell: null,
    };
  }

  private setup(initialTable: number[][]): void {
    this.initialTable = initialTable;
    this.result = initialTable.map((row) => row.map(() => null));
    this.availabilityTable = [];
    this.takenCardsTable = this.helperService
      .createZeroFilledArrayOfLength(
        TABLE_CONSTANTS.maxCellValue - TABLE_CONSTANTS.minCellValue,
      )
      .map(() =>
        this.helperService
          .createZeroFilledArrayOfLength(
            TABLE_CONSTANTS.maxCellValue - TABLE_CONSTANTS.minCellValue,
          )
          .map(() => 0),
      );
  }
}
