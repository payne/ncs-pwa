export interface Group {
  id?: string;
  name: string;
  description: string;
}

export interface GroupMember {
  id?: string;
  groupId: string;
  email: string;
}

export interface EditableGroup extends Group {
  isNew?: boolean;
}

export interface AppUser {
  id?: string;
  email: string;
  displayName: string;
  photoURL: string;
  lastLogin: number;
}
