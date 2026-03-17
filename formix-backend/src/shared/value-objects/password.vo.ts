import * as bcrypt from 'bcrypt';
import { DomainError } from '../domain-error';

const SALT_ROUNDS = 10;
const MIN_LENGTH = 8;
const HAS_NUMBER = /\d/;
const HAS_LETTER = /[a-zA-Z]/;

export class Password {
  private readonly hash: string;

  private constructor(hash: string) {
    this.hash = hash;
  }

  static async create(plaintext: string): Promise<Password> {
    if (plaintext.length < MIN_LENGTH) {
      throw new DomainError('Password must be at least 8 characters long');
    }
    if (!HAS_NUMBER.test(plaintext)) {
      throw new DomainError('Password must contain at least one number');
    }
    if (!HAS_LETTER.test(plaintext)) {
      throw new DomainError('Password must contain at least one letter');
    }

    const hash = await bcrypt.hash(plaintext, SALT_ROUNDS);
    return new Password(hash);
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  async compare(plaintext: string): Promise<boolean> {
    return bcrypt.compare(plaintext, this.hash);
  }

  getHash(): string {
    return this.hash;
  }
}
