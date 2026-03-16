import { DomainError } from './domain-error';

describe('DomainError', () => {
  it('should create a domain error with message', () => {
    const error = new DomainError('Invalid email');
    expect(error.message).toBe('Invalid email');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DomainError');
  });

  it('should be identifiable as DomainError', () => {
    const error = new DomainError('Some error');
    expect(error instanceof DomainError).toBe(true);
  });
});
