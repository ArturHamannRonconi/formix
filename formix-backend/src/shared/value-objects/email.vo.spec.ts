import { Email } from './email.vo';
import { DomainError } from '../domain-error';

describe('Email VO', () => {
  it('should create a valid email', () => {
    const email = Email.create('user@example.com');
    expect(email.getValue()).toBe('user@example.com');
  });

  it('should normalize email to lowercase', () => {
    const email = Email.create('User@EXAMPLE.COM');
    expect(email.getValue()).toBe('user@example.com');
  });

  it('should throw DomainError for invalid email without @', () => {
    expect(() => Email.create('notanemail')).toThrow(DomainError);
  });

  it('should throw DomainError for empty string', () => {
    expect(() => Email.create('')).toThrow(DomainError);
  });

  it('should throw DomainError for email without domain', () => {
    expect(() => Email.create('user@')).toThrow(DomainError);
  });

  it('should throw DomainError for email without local part', () => {
    expect(() => Email.create('@domain.com')).toThrow(DomainError);
  });
});
