interface PlaceIsTakenData {
  a: number;
  b: number;
  x: number;
  y: number;
  i: number;
  j: number;
  resultTable: string[][];
}

export class PlaceIsTakenError extends Error {
  constructor({ a, b, x, y, i, j, resultTable }: PlaceIsTakenData) {
    const message = `The place is taken already! ${a}-${b} [${x}, ${y}], [${i}, ${j}]. It's ${resultTable[x][y]} and ${resultTable[i][j]}`;
    super(message);
  }
}
