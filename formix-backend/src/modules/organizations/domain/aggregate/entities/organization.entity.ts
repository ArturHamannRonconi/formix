import { randomUUID } from 'crypto';
import { Slug } from '../value-objects/slug.vo';

interface OrganizationProps {
  id: string;
  name: string;
  slug: Slug;
  createdAt: Date;
  updatedAt: Date;
}

export class Organization {
  private props: OrganizationProps;

  private constructor(props: OrganizationProps) {
    this.props = props;
  }

  static create(name: string, slug: Slug): Organization {
    const now = new Date();
    return new Organization({
      id: randomUUID(),
      name,
      slug,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: OrganizationProps): Organization {
    return new Organization(props);
  }

  updateName(name: string, slug: Slug): void {
    this.props.name = name;
    this.props.slug = slug;
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): Slug {
    return this.props.slug;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
