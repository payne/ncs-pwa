import { NetAssignment } from './ncs-net-assignments.model';

export interface Net {
  id: string;
  name: string;
  createdAt: number;
  assignments: NetAssignment[];
}
