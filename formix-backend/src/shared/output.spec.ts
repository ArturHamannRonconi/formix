import { Output } from './output';

describe('Output', () => {
  describe('ok()', () => {
    it('should create a successful output without value', () => {
      const output = Output.ok();
      expect(output.isFailure).toBe(false);
    });

    it('should create a successful output with value', () => {
      const output = Output.ok({ id: '123' });
      expect(output.isFailure).toBe(false);
      expect(output.value).toEqual({ id: '123' });
    });
  });

  describe('fail()', () => {
    it('should create a failed output', () => {
      const output = Output.fail('something went wrong');
      expect(output.isFailure).toBe(true);
      expect(output.errorMessage).toBe('something went wrong');
    });

    it('should throw when accessing value of a failed output', () => {
      const output = Output.fail('error');
      expect(() => output.value).toThrow();
    });
  });
});
