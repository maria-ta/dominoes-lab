import { Injectable } from '@nestjs/common';
import { HelperService } from '../helper/helper.service';
import { Cell } from '../../interfaces/cell';
import { Guess } from '../../interfaces/guess';
import TABLE_CONSTANTS from '../../constants/table.const';
import { PlaceIsTakenError } from '../../models/errors/place-is-taken-error';
import { CardIsTakenError } from '../../models/errors/card-is-taken-error';
import { CannotBeSolvedError } from '../../models/errors/cannot-be-solved-error';
import { logMethodInfo } from '../../decorators/log-method-info.decorator';
import logger from '../../utils/logger';

@Injectable()
export class DominoesService {
  private initialTable: number[][];
  private result: string[][];
  private availabilityTable: Cell[][];
  private takenCardsTable: number[][];

  private guessingStack: Guess[];

  private anyCellWasChanged = false;
  private shouldBeReverted = false;

  constructor(private readonly helperService: HelperService) {}

  @logMethodInfo
  solveProblem(initialTable: number[][]): string[][] {
    logger.debug('Starting solving problem');
    this.setup(initialTable);
    let counter = 0;

    try {
      do {
        logger.debug(
          `---------------- Iteration #${counter} -------------------`,
        );
        this.availabilityTable = this.createAvailabilityTable();
        this.anyCellWasChanged = false;
        this.shouldBeReverted = false;

        initialTable.forEach((row, i) => {
          row.forEach((cell, j) => {
            if (!this.result[i][j]) {
              this.checkCell(i, j);
            }
          });
        });
        if (this.shouldBeReverted) {
          logger.debug('Solution marked as incorrect. Reverting');
          this.revert();
        } else {
          logger.debug('Availability table');
          this.logTable(
            this.availabilityTable.map((row) =>
              row.map((cell) => cell.quantity),
            ),
          );
          this.availabilityTable.forEach((row, a) => {
            row.forEach((cell, b) => {
              const wasCardTaken =
                this.takenCardsTable[Math.max(a, b)][Math.min(a, b)] > 0;
              if (
                cell.quantity === 1 &&
                !wasCardTaken &&
                !this.wasPlaceByCoordinatesTaken(cell.coordinates[0])
              ) {
                logger.debug(
                  `Found card with only one possible placement! It's [${[
                    a,
                    b,
                  ]}] on [${cell.coordinates[0]}]`,
                );
                this.updateResultWithCoordinates([
                  [a, b],
                  ...cell.coordinates[0],
                ]);
                this.anyCellWasChanged = true;
              }
            });
          });

          const noCellWasChanged = !this.anyCellWasChanged;
          if (noCellWasChanged) {
            logger.debug('No cell was changed');
            if (this.isProblemSolved()) {
              logger.debug('Problem is solved');
              return this.result;
            } else {
              logger.debug('Trying to guess next step');
              this.guess();
            }
          }
        }
        counter++;
      } while (this.anyCellWasChanged && counter < 15000);

      if (this.isProblemSolved()) {
        logger.debug('Problem is solved. Returning result');
        return this.result;
      } else {
        logger.debug('Problem cannot be solved. Throwing an error');
        throw new CannotBeSolvedError();
      }
    } catch (e) {
      this.logTable(this.result);
      this.logTable(this.initialTable);
      this.logTable(this.takenCardsTable);
      // this.logGuessingStack();
      logger.debug(this.guessingStack.length);
      throw e;
    }
  }

  /**
   * Adds coordinates of `card` to `availability table`.
   * @param card in format [number, number]
   * @param coordinates1 in format [number, number]
   * @param coordinates2 in format [number, number]
   */
  @logMethodInfo
  private updateAvailabilityOfCard(
    [a, b]: number[],
    [i, j]: number[],
    [x, y]: number[],
  ): void {
    // logger.debug('Update availability of card', Math.max(a, b), Math.min(a, b));
    // logger.debug(this.availabilityTable);
    const card = this.availabilityTable[Math.max(a, b)][Math.min(a, b)];
    let sortedCoordinates;
    if (x > i || y > j) {
      sortedCoordinates = [
        [i, j],
        [x, y],
      ];
    } else {
      sortedCoordinates = [
        [x, y],
        [i, j],
      ];
    }
    const alreadyContainsSuchCoordinates = card.coordinates.some(
      (coordinates) =>
        JSON.stringify(coordinates) === JSON.stringify(sortedCoordinates),
    );
    if (!alreadyContainsSuchCoordinates) {
      card.quantity++;
      card.coordinates.push(sortedCoordinates);
    }
  }

  /**
   * Updates result table with card data
   * @param card [card, cardCoordinates1, cardCoordinates2]
   */
  @logMethodInfo
  private updateResultWithCoordinates([
    [a, b],
    [x, y],
    [i, j],
  ]: number[][]): void {
    logger.debug(
      `Setting card [${Math.max(a, b)}, ${Math.min(
        a,
        b,
      )}] on [${x}, ${y}], [${i}, ${j}] to result`,
    );
    if (this.result[x][y] || this.result[i][j]) {
      throw new PlaceIsTakenError({
        a,
        b,
        x,
        y,
        i,
        j,
        resultTable: this.result,
      });
    }
    if (this.takenCardsTable[Math.max(a, b)][Math.min(a, b)] > 0) {
      throw new CardIsTakenError({
        a,
        b,
        x,
        y,
        i,
        j,
      });
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
    this.takenCardsTable[Math.max(a, b)][Math.min(a, b)] = 1;
  }

  /**
   *
   * @returns an array filled with default values for an `availabilityTable`: `{quantity: 0, coordinates: []}`
   */
  @logMethodInfo
  private createAvailabilityTable(): Cell[][] {
    return this.helperService
      .createZeroFilledArrayOfLength(
        TABLE_CONSTANTS.maxCellValue - TABLE_CONSTANTS.minCellValue + 1,
      )
      .map(() =>
        this.helperService
          .createZeroFilledArrayOfLength(
            TABLE_CONSTANTS.maxCellValue - TABLE_CONSTANTS.minCellValue + 1,
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
  @logMethodInfo
  private isProblemSolved(): boolean {
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
  @logMethodInfo
  private wasPlaceByCoordinatesTaken(coordinates: number[][]): boolean {
    const [[x, y], [i, j]] = coordinates;
    return !!this.result[x][y] || !!this.result[i][j];
  }

  /**
   *
   * @param i
   * @param j
   */
  @logMethodInfo
  private checkCell(i: number, j: number): void {
    logger.debug(`Check cell [${i}, ${j}]`);
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
      logger.debug(`Cell has only one possible neighbour`);
      try {
        this.updateResultWithCoordinates(lastVariant);
        this.anyCellWasChanged = true;
      } catch (e) {
        logger.debug('Can not place the card:', e.message);
      }
    } else if (numberOfPossibleVariants === 0) {
      logger.debug(
        `Cell has ${numberOfPossibleVariants} neighbours. Solution should be reverted`,
      );
      this.shouldBeReverted = true;
    } else {
      logger.debug(`Cell has ${numberOfPossibleVariants} neighbours`);
      allVariants.forEach(([ab, ij, xy]) => {
        this.updateAvailabilityOfCard(ab, ij, xy);
      });
    }
  }

  @logMethodInfo
  private guess(except: string[] = []): void {
    const { ab, cell } = this.findFirstWithMoreThanOnePossibleVariants(except);
    const [a, b] = ab;
    if (cell) {
      logger.debug(
        `Found cell with multiple possible placements: [${ab}] with coordinates ${cell.coordinates}`,
      );
      let shouldTryWithOtherCoordinates = false;
      let shouldGuessAgain = false;
      do {
        try {
          this.updateGuessingStack([a, b], cell, except);
          this.updateResultWithCoordinates([[a, b], ...cell.coordinates[0]]);
          this.anyCellWasChanged = true;
        } catch (e) {
          cell.coordinates.splice(0, 1);
          if (cell.coordinates.length) {
            shouldTryWithOtherCoordinates = true;
          } else {
            shouldTryWithOtherCoordinates = false;
            shouldGuessAgain = true;
          }
        }
      } while (shouldTryWithOtherCoordinates);
      if (shouldGuessAgain) {
        this.guess([...except, this.getExcept(a, b)]);
      }
    } else {
      logger.debug('No cell found. Reverting');
      this.revert();
    }
  }

  @logMethodInfo
  private revert(): void {
    if (this.guessingStack.length) {
      logger.debug('There are some guesses left');
      const previousGuess = this.guessingStack.pop();
      const nextCoordinates = previousGuess.nextGuesses;
      logger.debug(
        `Getting previous guess. The card is [${
          previousGuess.ab
        }] and coordinates are ${JSON.stringify(nextCoordinates)}`,
      );

      this.result = JSON.parse(previousGuess.result);
      this.takenCardsTable = JSON.parse(previousGuess.takenCardsTable);
      this.availabilityTable = JSON.parse(previousGuess.availabilityTable);

      if (nextCoordinates.length) {
        let error;
        do {
          try {
            logger.debug(`Trying to put card on [${nextCoordinates[0]}]`);
            this.updateResultWithCoordinates([
              previousGuess.ab,
              ...nextCoordinates[0],
            ]);

            logger.debug(
              'Card put successfully. Remove coordinates from future guesses',
            );
            nextCoordinates.splice(0, 1);
          } catch (e) {
            logger.debug('An error occurred: ', e.message);
            error = e;
            logger.debug('Will try with next coordinates');
            nextCoordinates.splice(0, 1);
          }
        } while (error && nextCoordinates.length);

        if (nextCoordinates.length) {
          logger.debug(
            'Some coordinates options left. Preparing new guess item',
          );
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
          previousGuess.except.push(this.getExcept(a, b));
          this.guess(previousGuess.except);
        }
      } else {
        logger.debug('No coordinates. Reverting');
        this.revert();
      }
    } else {
      logger.debug('No more guesses left');
    }
  }

  private getExcept(a: number, b: number): string {
    return `${Math.max(a, b)}${Math.min(a, b)}`;
  }

  @logMethodInfo
  private updateGuessingStack([a, b], cell, except: string[] = []): void {
    const cellCoordinatesCopy = JSON.parse(JSON.stringify(cell.coordinates));
    cellCoordinatesCopy.splice(0, 1);
    const guessingStackItem: Guess = {
      ab: [a, b],
      result: JSON.stringify(this.result),
      takenCardsTable: JSON.stringify(this.takenCardsTable),
      availabilityTable: JSON.stringify(this.availabilityTable),
      nextGuesses: cellCoordinatesCopy,
      except,
    };
    logger.debug(
      `Put item to guessing stack: [${[
        a,
        b,
      ]}] with next coordinates ${cellCoordinatesCopy}`,
    );
    this.guessingStack.push(guessingStackItem);
  }

  @logMethodInfo
  private findFirstWithMoreThanOnePossibleVariants(except): {
    ab: number[];
    cell: Cell;
  } {
    except = except || [];
    for (let a = 0; a < this.availabilityTable.length; a++) {
      const row = this.availabilityTable[a];
      for (let b = 0; b < row.length; b++) {
        const cell = row[b];
        const wasCardTaken =
          this.takenCardsTable[Math.max(a, b)][Math.min(a, b)] > 0;
        const shouldNotSkipThisCell = !(
          except.includes(`${a}${b}`) || except.includes(`${b}${a}`)
        );
        if (cell.quantity === 2 && !wasCardTaken && shouldNotSkipThisCell) {
          return {
            ab: [a, b],
            cell: cell,
          };
        }
      }
    }
    return {
      ab: [null, null],
      cell: null,
    };
  }

  private setup(initialTable: number[][]): void {
    this.guessingStack = [];
    this.initialTable = initialTable;
    this.result = initialTable.map((row) => row.map(() => null));
    this.availabilityTable = [];
    this.takenCardsTable = this.helperService
      .createZeroFilledArrayOfLength(
        TABLE_CONSTANTS.maxCellValue - TABLE_CONSTANTS.minCellValue + 1,
      )
      .map(() =>
        this.helperService
          .createZeroFilledArrayOfLength(
            TABLE_CONSTANTS.maxCellValue - TABLE_CONSTANTS.minCellValue + 1,
          )
          .map(() => 0),
      );
  }

  private logTable<T>(table: T[][]): void {
    logger.debug('==========================================');
    logger.debug('+, ' + table[0].map((cell, i) => i).join(', '));
    logger.debug(
      table
        .map((row, i) => `${i}, ` + row.map((cell) => cell || '-').join(', '))
        .join('\n'),
    );
  }
}
