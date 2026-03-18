export class Output<T = void> {
  private constructor(
    private readonly _value: T | undefined,
    private readonly _errorMessage: string | undefined,
  ) {}

  static ok(): Output<void>;
  static ok<T>(value: T): Output<T>;
  static ok<T>(value?: T): Output<T | void> {
    return new Output(value, undefined) as Output<T | void>;
  }

  static fail<T = void>(errorMessage: string): Output<T> {
    return new Output<T>(undefined, errorMessage);
  }

  get isFailure(): boolean {
    return this._errorMessage !== undefined;
  }

  get value(): T {
    if (this._errorMessage !== undefined) {
      throw new Error('Cannot access value of a failed Output');
    }
    return this._value as T;
  }

  get errorMessage(): string {
    return this._errorMessage as string;
  }
}
