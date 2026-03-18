import { MemberRole } from '../value-objects/member-role.enum';
import { MembershipId } from '../value-objects/membership-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';

interface MembershipProps {
  id: MembershipId;
  userId: UserId;
  role: MemberRole;
  createdAt: Date;
}

type CreateMembershipProps = Omit<MembershipProps, 'id' | 'createdAt'>;

export class MembershipEntity {
  private props: MembershipProps;

  private constructor(props: MembershipProps) {
    this.props = props;
  }

  static create(input: CreateMembershipProps): MembershipEntity {
    return new MembershipEntity({
      id: MembershipId.create(),
      userId: input.userId,
      role: input.role,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: MembershipProps): MembershipEntity {
    return new MembershipEntity(props);
  }

  isAdmin(): boolean {
    return this.props.role === MemberRole.ADMIN;
  }

  get id(): MembershipId {
    return this.props.id;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get role(): MemberRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
