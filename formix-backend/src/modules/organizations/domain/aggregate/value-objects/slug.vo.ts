import { DomainError } from '@shared/domain-error';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class Slug {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Slug {
    if (!SLUG_REGEX.test(value)) {
      throw new DomainError(`Invalid slug: "${value}". Must be lowercase alphanumeric with hyphens (no leading, trailing or consecutive hyphens)`);
    }
    return new Slug(value);
  }

  static fromName(name: string): Slug {
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return Slug.create(slug);
  }

  getValue(): string {
    return this.value;
  }
}
