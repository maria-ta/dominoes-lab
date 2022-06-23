import dominoesProcessorFn from './dominoes.processor';

describe('DominoesProcessor', () => {
  it('should solve the problem', () => {
    const initialTable = [
      [4, 6, 0, 1, 1, 1, 1, 6],
      [0, 5, 6, 0, 6, 2, 5, 1],
      [4, 3, 3, 4, 5, 4, 0, 4],
      [6, 5, 3, 2, 5, 4, 0, 2],
      [6, 3, 6, 3, 0, 1, 2, 4],
      [0, 3, 1, 5, 2, 3, 2, 4],
      [5, 1, 2, 0, 3, 2, 6, 5],
    ];
    const job = {
      data: {
        initialTable,
      },
    } as any;
    const expectedResult = [
      ['l', 'r', 'l', 'r', 'l', 'r', 'l', 'r'],
      ['t', 'l', 'r', 'l', 'r', 'l', 'r', 't'],
      ['b', 't', 'l', 'r', 't', 't', 't', 'b'],
      ['t', 'b', 't', 't', 'b', 'b', 'b', 't'],
      ['b', 't', 'b', 'b', 't', 't', 't', 'b'],
      ['t', 'b', 'l', 'r', 'b', 'b', 'b', 't'],
      ['b', 'l', 'r', 'l', 'r', 'l', 'r', 'b'],
    ];
    const callback = (error, result) => {
      expect(result).toEqual(expectedResult);
    };

    dominoesProcessorFn(job, callback);
  });
});
