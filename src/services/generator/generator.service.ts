import { Injectable } from '@nestjs/common';
import { AutoGeneratedSolution } from '../../interfaces/auto-generated-solution';
import TABLE_CONSTANTS from '../../constants/table.const';
import { WrongArgumentError } from '../../models/errors/wrong-argument-error';
import logger from '../../utils/logger';
import { logMethodInfo } from '../../decorators/log-method-info.decorator';

const MAX_NUMBER_OF_ITERATIONS = 1000;
const MAX_NUMBER_OF_RETRIES = 10;

@Injectable()
export class GeneratorService {
  private field: AutoGeneratedSolution;
  private cards: number[][];
  private anyCellWasChanged: boolean;

  @logMethodInfo
  generateValidData(retriesCounter = 0): AutoGeneratedSolution {
    try {
      let iterationCounter = 0;
      let isGenerationInProgress = false;
      this.field = this.generateField();
      this.cards = this.generateCards();

      do {
        this.anyCellWasChanged = false;
        this.field.positions.forEach((row, i) => {
          logger.debug(`                   Row #${i}`);
          row.forEach((cell, j) => {
            logger.debug('------------------------------------------');
            logger.debug(`                   Cell #${j}`);
            if (!cell) {
              const randomCard = this.spliceRandomElementFromAnArray(
                this.cards,
              );
              logger.debug(
                `Get random card ${randomCard}, cards left ${this.cards.length}`,
              );
              this.placeCard(randomCard, [i, j]);
            } else {
              logger.debug('Place is taken');
            }
          });
        });
        iterationCounter++;
        isGenerationInProgress = this.isGenerationInProgress();
      } while (
        (isGenerationInProgress ||
          iterationCounter < MAX_NUMBER_OF_ITERATIONS) &&
        this.anyCellWasChanged
      );
    } catch (e) {
      this.logTable(this.field.positions);
      this.logTable(this.field.numbers);
      if (retriesCounter < MAX_NUMBER_OF_RETRIES) {
        return this.generateValidData(retriesCounter + 1);
      } else {
        throw e;
      }
    }

    return this.field;
  }

  @logMethodInfo
  generateInvalidData(): AutoGeneratedSolution {
    const randomPosition = [
      Math.min(3, TABLE_CONSTANTS.height),
      Math.min(4, TABLE_CONSTANTS.width),
    ];

    this.generateValidData();

    this.field.numbers[randomPosition[0]][randomPosition[1]] = 0;

    return this.field;
  }

  private generateCards(): number[][] {
    const result = [];

    for (
      let i = TABLE_CONSTANTS.minCellValue;
      i <= TABLE_CONSTANTS.maxCellValue;
      i++
    ) {
      for (let j = i; j <= TABLE_CONSTANTS.maxCellValue; j++) {
        result.push([i, j]);
      }
    }

    return result;
  }

  private generateField(): AutoGeneratedSolution {
    const result = {
      numbers: [],
      positions: [],
    };
    for (let i = 0; i < TABLE_CONSTANTS.height; i++) {
      result.numbers.push([]);
      result.positions.push([]);
      for (let j = 0; j < TABLE_CONSTANTS.width; j++) {
        result.numbers[i].push(null);
        result.positions[i].push(null);
      }
    }
    return result;
  }

  private isGenerationInProgress(): boolean {
    return this.field.positions.some((row) => row.some((cell) => !cell));
  }

  private placeCard(card: number[], position: number[]): void {
    logger.debug(`Place card on position ${position}`);
    const [i, j] = position;
    const availableOptions = this.getAvailableOptions(i, j);
    const optionsWithOnlyOnePossibleOptions = availableOptions.filter(
      ([i, j]) => this.getNumberOfAvailableOptions(i, j) === 1,
    );

    logger.debug(
      `The position has ${availableOptions.length} options, ${optionsWithOnlyOnePossibleOptions.length} from them MUST be used now`,
    );

    if (optionsWithOnlyOnePossibleOptions.length > 1) {
      logger.debug(
        `More than 1 option must be used now, which means that something went wrong`,
      );
      throw new WrongArgumentError('Cannot generate table. Please try again');
    } else if (optionsWithOnlyOnePossibleOptions.length === 1) {
      logger.debug(`There is one option which should be used now`);
      this.placeCardOn(card, position, availableOptions[0]);
    } else if (availableOptions.length > 0) {
      logger.debug(`There are multiple options which could be used now`);
      const randomPosition = this.getRandomElementFromAnArray(availableOptions);
      logger.debug(`Random option is ${randomPosition}`);
      this.placeCardOn(card, position, randomPosition);
    } else {
      logger.debug(
        `There are no available options, which means that something went wrong`,
      );
      throw new WrongArgumentError('Cannot generate table. Please try again');
    }
  }

  private placeCardOn(
    [a, b]: number[],
    [x, y]: number[],
    [i, j]: number[],
  ): void {
    logger.debug(`Place card on [${x}, ${y}], [${i}, ${j}]`);
    this.anyCellWasChanged = true;
    this.field.numbers[x][y] = a;
    this.field.numbers[i][j] = b;

    let labels: string[];
    if (x < i) {
      labels = ['t', 'b'];
    } else {
      labels = ['l', 'r'];
    }

    this.field.positions[x][y] = labels[0];
    this.field.positions[i][j] = labels[1];
  }

  private getRandomElementFromAnArray<T>(arr: T[]): T {
    const randomIndex = Math.round(Math.random() * (arr.length - 1));
    return arr[randomIndex];
  }

  private spliceRandomElementFromAnArray<T>(arr: T[]): T {
    const randomIndex = Math.round(Math.random() * (arr.length - 1));
    return arr.splice(randomIndex, 1)[0];
  }

  private isPositionTaken(i: number, j: number): boolean {
    return !!this.field.positions[i][j];
  }

  private getNumberOfAvailableOptions(i: number, j: number): number {
    return this.getAvailableOptions(i, j).length;
  }

  private getAvailableOptions(i: number, j: number): number[][] {
    const positionsToCheck = [
      [i + 1, j],
      [i - 1, j],
      [i, j + 1],
      [i, j - 1],
    ];
    return positionsToCheck.filter(([i, j]) => {
      const isIInRange = i >= 0 && i < TABLE_CONSTANTS.height;
      const isJInRange = j >= 0 && j < TABLE_CONSTANTS.width;
      return isIInRange && isJInRange && !this.isPositionTaken(i, j);
    });
  }

  private logTable<T>(arr: T[][]): void {
    logger.debug('--------------------------------');
    logger.debug(
      arr.map((row) => row.map((cell) => cell || '-').join(', ')).join('\n'),
    );
  }
}
