import { Injectable } from '@nestjs/common';

@Injectable()
export class HelperService {
  /**
   * Creates an array of specified length filled with `0`
   * @param {number} length
   * @returns {number[]} an array of specified length filled with `0`
   */
  createZeroFilledArrayOfLength(length) {
    return [...Array(length)].map(Number.prototype.valueOf, 0);
  }
}
