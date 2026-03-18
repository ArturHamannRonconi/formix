import { DomainError } from '@shared/domain-error';
import { OrganizationId } from './value-objects/organization-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Slug } from './value-objects/slug.vo';
import { MembershipEntity } from './entities/membership.entity';
import { MemberRole } from './value-objects/member-role.enum';

interface OrganizationProps {
  id: OrganizationId;
  name: string;
  slug: Slug;
  members: MembershipEntity[];
  createdAt: Date;
  updatedAt: Date;
}

type CreateOrganizationProps = Omit<OrganizationProps, 'id' | 'members' | 'createdAt' | 'updatedAt'> & {
  initialAdminId: UserId;
};

export class Organization {
  private props: OrganizationProps;

  private constructor(props: OrganizationProps) {
    this.props = props;
  }

  static create(input: CreateOrganizationProps): Organization {
    const now = new Date();
    const initialMember = MembershipEntity.create({
      userId: input.initialAdminId,
      role: MemberRole.ADMIN,
    });
    return new Organization({
      id: OrganizationId.create(),
      name: input.name,
      slug: input.slug,
      members: [initialMember],
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

  findMemberByUserId(userId: UserId): MembershipEntity | null {
    return this.props.members.find(m => m.userId.equals(userId)) ?? null;
  }

  addMember(userId: UserId, role: MemberRole): void {
    if (this.findMemberByUserId(userId)) {
      throw new DomainError('User is already a member of this organization');
    }
    const membership = MembershipEntity.create({ userId, role });
    this.props.members.push(membership);
    this.props.updatedAt = new Date();
  }

  removeMember(userId: UserId): void {
    const admins = this.props.members.filter(m => m.isAdmin());
    const memberToRemove = this.findMemberByUserId(userId);
    if (memberToRemove?.isAdmin() && admins.length === 1) {
      throw new DomainError('Cannot remove the last admin of an organization');
    }
    this.props.members = this.props.members.filter(m => !m.userId.equals(userId));
    this.props.updatedAt = new Date();
  }

  get id(): OrganizationId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): Slug {
    return this.props.slug;
  }

  get members(): MembershipEntity[] {
    return [...this.props.members];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
