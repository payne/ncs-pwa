import { Injectable } from '@angular/core';
import { getDatabase, Database, ref, get, onValue, off } from 'firebase/database';
import { AuthService } from './auth.service';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { Group, GroupMember } from '../_models/ncs-settings.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private db: Database;
  private userGroupsSubject = new BehaviorSubject<string[]>([]);
  private groupsSubject = new BehaviorSubject<Group[]>([]);
  private initialized = false;

  // Special user always treated as DCARES member
  private readonly SUPER_USER_EMAIL = 'matt.n3pay@gmail.com';
  private readonly ADMIN_GROUP_NAME = 'DCARES';

  constructor(private authService: AuthService) {
    this.db = getDatabase();
    this.initializePermissions();
  }

  private initializePermissions(): void {
    // Listen to auth state changes
    this.authService.getAuthState().subscribe(user => {
      if (user?.email) {
        this.loadUserGroups(user.email);
        this.loadGroups();
      } else {
        this.userGroupsSubject.next([]);
      }
    });
  }

  private loadGroups(): void {
    const groupsRef = ref(this.db, 'groups');
    onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groups: Group[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        this.groupsSubject.next(groups);
      } else {
        this.groupsSubject.next([]);
      }
    });
  }

  private loadUserGroups(email: string): void {
    const membersRef = ref(this.db, 'groupMembers');
    const groupsRef = ref(this.db, 'groups');

    // Listen to both group members and groups
    onValue(membersRef, async (membersSnapshot) => {
      const membersData = membersSnapshot.val();
      const groupsSnapshot = await get(groupsRef);
      const groupsData = groupsSnapshot.val();

      const userGroupNames: string[] = [];

      // Check if user is the super user - always add DCARES
      if (email.toLowerCase() === this.SUPER_USER_EMAIL.toLowerCase()) {
        userGroupNames.push(this.ADMIN_GROUP_NAME);
      }

      if (membersData && groupsData) {
        // Find all group IDs the user belongs to
        const userGroupIds = Object.keys(membersData)
          .filter(key => membersData[key].email.toLowerCase() === email.toLowerCase())
          .map(key => membersData[key].groupId);

        // Map group IDs to group names
        userGroupIds.forEach(groupId => {
          if (groupsData[groupId]) {
            const groupName = groupsData[groupId].name;
            if (!userGroupNames.includes(groupName)) {
              userGroupNames.push(groupName);
            }
          }
        });
      }

      this.userGroupsSubject.next(userGroupNames);
      this.initialized = true;
    });
  }

  getUserGroups(): Observable<string[]> {
    return this.userGroupsSubject.asObservable();
  }

  async getUserGroupsOnce(): Promise<string[]> {
    const email = this.authService.getUserEmail();
    if (!email) return [];

    const userGroupNames: string[] = [];

    // Check if user is the super user
    if (email.toLowerCase() === this.SUPER_USER_EMAIL.toLowerCase()) {
      userGroupNames.push(this.ADMIN_GROUP_NAME);
    }

    const membersRef = ref(this.db, 'groupMembers');
    const groupsRef = ref(this.db, 'groups');

    const [membersSnapshot, groupsSnapshot] = await Promise.all([
      get(membersRef),
      get(groupsRef)
    ]);

    const membersData = membersSnapshot.val();
    const groupsData = groupsSnapshot.val();

    if (membersData && groupsData) {
      const userGroupIds = Object.keys(membersData)
        .filter(key => membersData[key].email.toLowerCase() === email.toLowerCase())
        .map(key => membersData[key].groupId);

      userGroupIds.forEach(groupId => {
        if (groupsData[groupId]) {
          const groupName = groupsData[groupId].name;
          if (!userGroupNames.includes(groupName)) {
            userGroupNames.push(groupName);
          }
        }
      });
    }

    return userGroupNames;
  }

  isInGroup(groupName: string): Observable<boolean> {
    return this.userGroupsSubject.pipe(
      map(groups => groups.some(g => g.toLowerCase() === groupName.toLowerCase()))
    );
  }

  async isInGroupOnce(groupName: string): Promise<boolean> {
    const groups = await this.getUserGroupsOnce();
    return groups.some(g => g.toLowerCase() === groupName.toLowerCase());
  }

  isInAnyGroup(): Observable<boolean> {
    return this.userGroupsSubject.pipe(
      map(groups => groups.length > 0)
    );
  }

  async isInAnyGroupOnce(): Promise<boolean> {
    const groups = await this.getUserGroupsOnce();
    return groups.length > 0;
  }

  isAdmin(): Observable<boolean> {
    return this.isInGroup(this.ADMIN_GROUP_NAME);
  }

  async isAdminOnce(): Promise<boolean> {
    return this.isInGroupOnce(this.ADMIN_GROUP_NAME);
  }

  async canAccessNet(netId: string): Promise<boolean> {
    const email = this.authService.getUserEmail();
    if (!email) return false;

    // Admins can access all NETs
    if (await this.isAdminOnce()) {
      return true;
    }

    // Get the NET's creator group
    const netRef = ref(this.db, `nets/${netId}`);
    const netSnapshot = await get(netRef);
    const netData = netSnapshot.val();

    if (!netData) return false;

    // If NET has no creator group, allow access (legacy NETs)
    if (!netData.creatorGroup) {
      return true;
    }

    // Check if user is in the same group as the NET creator
    const userGroups = await this.getUserGroupsOnce();
    return userGroups.some(g => g.toLowerCase() === netData.creatorGroup.toLowerCase());
  }

  async getGroupIdByName(groupName: string): Promise<string | null> {
    const groupsRef = ref(this.db, 'groups');
    const snapshot = await get(groupsRef);
    const data = snapshot.val();

    if (data) {
      for (const key of Object.keys(data)) {
        if (data[key].name.toLowerCase() === groupName.toLowerCase()) {
          return key;
        }
      }
    }
    return null;
  }
}
