const DEFAULT_MESSAGE = 'Wrong argument';

export class WrongArgumentError extends Error {
  constructor(message?: string) {
    super(message || DEFAULT_MESSAGE);
  }
}
