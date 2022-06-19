interface CardIsTakenData {
  a: number;
  b: number;
  x: number;
  y: number;
  i: number;
  j: number;
}

export class CardIsTakenError extends Error {
  constructor({ a, b, x, y, i, j }: CardIsTakenData) {
    const message = `The card is taken already! ${a}-${b} [${x}, ${y}], [${i}, ${j}].`;
    super(message);
  }
}
