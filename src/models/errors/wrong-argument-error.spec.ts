import { WrongArgumentError } from './wrong-argument-error';

describe('WrongArgumentError', () => {
  it('should create an error with specified message', () => {
    const message = 'Test';
    const error = new WrongArgumentError(message);

    expect(error.message).toEqual(message);
  });

  it('should create an error with default message when no specified message', () => {
    const defaultMessage = 'Wrong argument';
    const error = new WrongArgumentError();

    expect(error.message).toEqual(defaultMessage);
  });
});
