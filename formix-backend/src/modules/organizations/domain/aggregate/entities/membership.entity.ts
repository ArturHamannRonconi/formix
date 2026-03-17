import { randomUUID } from 'crypto';
import { MemberRole } from '../value-objects/member-role.enum';

interface MembershipProps {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  createdAt: Date;
}

type CreateMembershipProps = Omit<MembershipProps, 'id' | 'createdAt'>;

export class Membership {
  private props: MembershipProps;

  private constructor(props: MembershipProps) {
    this.props = props;
  }

  static create(input: CreateMembershipProps): Membership {
    return new Membership({
      id: randomUUID(),
      userId: input.userId,
      organizationId: input.organizationId,
      role: input.role,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: MembershipProps): Membership {
    return new Membership(props);
  }

  isAdmin(): boolean {
    return this.props.role === MemberRole.ADMIN;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get role(): MemberRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
