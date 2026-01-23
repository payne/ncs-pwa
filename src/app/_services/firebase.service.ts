import { Injectable } from '@angular/core';
import { getDatabase, Database, ref, set, onValue, push, remove, update, off, get } from 'firebase/database';
import { NetEntry } from '../_models/net-entry.model';
import { Operator } from '../_models/operator.model';
import { Group, GroupMember, AppUser } from '../_models/ncs-settings.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db: Database;
  private currentNetId: string = '';

  constructor() {
    this.db = getDatabase();
  }

  setCurrentNet(netId: string): void {
    this.currentNetId = netId;
  }

  getCurrentNetId(): string {
    return this.currentNetId;
  }

  getEntries(netId: string): Observable<NetEntry[]> {
    return new Observable(observer => {
      const entriesRef = ref(this.db, `nets/${netId}/entries`);

      const unsubscribe = onValue(entriesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const entries: NetEntry[] = Object.keys(data).map(key => ({
            ...this.getDefaultEntry(),
            ...data[key],
            id: key
          }));
          observer.next(entries);
        } else {
          observer.next([]);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => {
        off(entriesRef);
      };
    });
  }

  addEntry(netId: string, entry: Partial<NetEntry>): Promise<void> {
    const entriesRef = ref(this.db, `nets/${netId}/entries`);
    const newEntryRef = push(entriesRef);
    const { id, isEditing, ...entryWithoutId } = entry as any;
    return set(newEntryRef, entryWithoutId);
  }

  updateEntry(netId: string, entryId: string, entry: Partial<NetEntry>): Promise<void> {
    const entryRef = ref(this.db, `nets/${netId}/entries/${entryId}`);
    const { id, isEditing, ...updateData } = entry as any;
    return update(entryRef, updateData);
  }

  deleteEntry(netId: string, entryId: string): Promise<void> {
    const entryRef = ref(this.db, `nets/${netId}/entries/${entryId}`);
    return remove(entryRef);
  }

  createNet(netName: string, creatorEmail: string, creatorGroup: string): Promise<string> {
    const netsRef = ref(this.db, 'nets');
    const newNetRef = push(netsRef);
    const netId = newNetRef.key || '';

    return set(newNetRef, {
      name: netName,
      createdAt: Date.now(),
      creatorEmail: creatorEmail,
      creatorGroup: creatorGroup,
      entries: {}
    }).then(() => netId);
  }

  getNets(): Observable<any[]> {
    return new Observable(observer => {
      const netsRef = ref(this.db, 'nets');

      const unsubscribe = onValue(netsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const nets = Object.keys(data).map(key => ({
            id: key,
            name: data[key].name,
            createdAt: data[key].createdAt,
            creatorEmail: data[key].creatorEmail || '',
            creatorGroup: data[key].creatorGroup || ''
          }));
          observer.next(nets);
        } else {
          observer.next([]);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => {
        off(netsRef);
      };
    });
  }

  async getNetOnce(netId: string): Promise<any> {
    const netRef = ref(this.db, `nets/${netId}`);
    const snapshot = await get(netRef);
    const data = snapshot.val();
    if (data) {
      return {
        id: netId,
        name: data.name,
        createdAt: data.createdAt,
        creatorEmail: data.creatorEmail || '',
        creatorGroup: data.creatorGroup || ''
      };
    }
    return null;
  }

  // People collection methods
  getPeople(): Observable<Operator[]> {
    return new Observable(observer => {
      const peopleRef = ref(this.db, 'people');

      const unsubscribe = onValue(peopleRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const people: Operator[] = Object.keys(data).map(key => ({
            ...data[key],
            id: key
          }));
          observer.next(people);
        } else {
          observer.next([]);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => {
        off(peopleRef);
      };
    });
  }

  async getPeopleOnce(): Promise<Operator[]> {
    const peopleRef = ref(this.db, 'people');
    const snapshot = await get(peopleRef);
    const data = snapshot.val();
    if (data) {
      return Object.keys(data).map(key => ({
        ...data[key],
        id: key
      }));
    }
    return [];
  }

  addPerson(person: Operator): Promise<void> {
    const peopleRef = ref(this.db, 'people');
    const newPersonRef = push(peopleRef);
    return set(newPersonRef, {
      name: person.name,
      callsign: person.callsign,
      clubs: person.clubs || []
    });
  }

  updatePerson(personId: string, data: Partial<Operator>): Promise<void> {
    const personRef = ref(this.db, `people/${personId}`);
    const { id, ...updateData } = data as any;
    return update(personRef, updateData);
  }

  deletePerson(personId: string): Promise<void> {
    const personRef = ref(this.db, `people/${personId}`);
    return remove(personRef);
  }

  // Groups collection methods
  getGroups(): Observable<Group[]> {
    return new Observable(observer => {
      const groupsRef = ref(this.db, 'groups');

      const unsubscribe = onValue(groupsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const groups: Group[] = Object.keys(data).map(key => ({
            ...data[key],
            id: key
          }));
          observer.next(groups);
        } else {
          observer.next([]);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => {
        off(groupsRef);
      };
    });
  }

  addGroup(group: Group): Promise<void> {
    const groupsRef = ref(this.db, 'groups');
    const newGroupRef = push(groupsRef);
    return set(newGroupRef, {
      name: group.name,
      description: group.description
    });
  }

  updateGroup(groupId: string, data: Partial<Group>): Promise<void> {
    const groupRef = ref(this.db, `groups/${groupId}`);
    const { id, ...updateData } = data as any;
    return update(groupRef, updateData);
  }

  deleteGroup(groupId: string): Promise<void> {
    const groupRef = ref(this.db, `groups/${groupId}`);
    return remove(groupRef);
  }

  async deleteGroupWithMembers(groupId: string): Promise<void> {
    // Get the group name for userGroups cleanup
    const groupSnapshot = await get(ref(this.db, `groups/${groupId}`));
    const groupData = groupSnapshot.val();
    const groupName = groupData?.name;

    // Get all members of this group
    const membersRef = ref(this.db, 'groupMembers');
    const snapshot = await get(membersRef);
    const data = snapshot.val();

    if (data) {
      const deletePromises: Promise<void>[] = [];
      Object.keys(data).forEach(key => {
        if (data[key].groupId === groupId) {
          // Delete from groupMembers
          deletePromises.push(remove(ref(this.db, `groupMembers/${key}`)));

          // Delete from userGroups index
          if (groupName) {
            const sanitizedEmail = data[key].email.replace(/\./g, ',');
            deletePromises.push(remove(ref(this.db, `userGroups/${sanitizedEmail}/${groupName}`)));
          }
        }
      });
      await Promise.all(deletePromises);
    }

    // Then delete the group itself
    return this.deleteGroup(groupId);
  }

  // Group Members collection methods
  getGroupMembers(groupId: string): Observable<GroupMember[]> {
    return new Observable(observer => {
      const membersRef = ref(this.db, 'groupMembers');

      const unsubscribe = onValue(membersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const members: GroupMember[] = Object.keys(data)
            .filter(key => data[key].groupId === groupId)
            .map(key => ({
              ...data[key],
              id: key
            }));
          observer.next(members);
        } else {
          observer.next([]);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => {
        off(membersRef);
      };
    });
  }

  async addGroupMember(member: GroupMember): Promise<void> {
    const membersRef = ref(this.db, 'groupMembers');
    const newMemberRef = push(membersRef);
    await set(newMemberRef, {
      groupId: member.groupId,
      email: member.email
    });

    // Update userGroups index for permission checking
    const groupSnapshot = await get(ref(this.db, `groups/${member.groupId}`));
    const groupData = groupSnapshot.val();
    if (groupData?.name) {
      const sanitizedEmail = member.email.replace(/\./g, ',');
      await set(ref(this.db, `userGroups/${sanitizedEmail}/${groupData.name}`), true);
    }
  }

  async deleteGroupMember(memberId: string): Promise<void> {
    // First get the member info to update userGroups
    const memberSnapshot = await get(ref(this.db, `groupMembers/${memberId}`));
    const memberData = memberSnapshot.val();

    if (memberData) {
      // Get the group name
      const groupSnapshot = await get(ref(this.db, `groups/${memberData.groupId}`));
      const groupData = groupSnapshot.val();

      // Remove from groupMembers
      await remove(ref(this.db, `groupMembers/${memberId}`));

      // Update userGroups index
      if (groupData?.name) {
        const sanitizedEmail = memberData.email.replace(/\./g, ',');
        await remove(ref(this.db, `userGroups/${sanitizedEmail}/${groupData.name}`));
      }
    } else {
      await remove(ref(this.db, `groupMembers/${memberId}`));
    }
  }

  // Users collection methods
  getUsers(): Observable<AppUser[]> {
    return new Observable(observer => {
      const usersRef = ref(this.db, 'users');

      const unsubscribe = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const users: AppUser[] = Object.keys(data).map(key => ({
            ...data[key],
            id: key
          }));
          observer.next(users);
        } else {
          observer.next([]);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => {
        off(usersRef);
      };
    });
  }

  async saveUser(user: AppUser): Promise<void> {
    // Use email as key (sanitized for Firebase path)
    const sanitizedEmail = user.email.replace(/\./g, ',');
    const userRef = ref(this.db, `users/${sanitizedEmail}`);

    // Get existing user data to preserve fields
    const existingSnapshot = await get(userRef);
    const existingData = existingSnapshot.val() || {};

    return set(userRef, {
      ...existingData,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: user.lastLogin
    });
  }

  async getUserByEmail(email: string): Promise<AppUser | null> {
    const sanitizedEmail = email.replace(/\./g, ',');
    const userRef = ref(this.db, `users/${sanitizedEmail}`);
    const snapshot = await get(userRef);
    const data = snapshot.val();
    if (data) {
      return {
        ...data,
        id: sanitizedEmail
      };
    }
    return null;
  }

  async updateUserProfile(email: string, updates: Partial<AppUser>): Promise<void> {
    const sanitizedEmail = email.replace(/\./g, ',');
    const userRef = ref(this.db, `users/${sanitizedEmail}`);
    const { id, ...updateData } = updates as any;
    return update(userRef, updateData);
  }

  // Backup method - fetch all data for backup
  async getAllDataForBackup(): Promise<{
    nets: any[];
    people: any[];
    groups: any[];
    groupMembers: any[];
    users: any[];
    userGroups: any[];
    duties: any[];
    locations: any[];
  }> {
    const [netsSnapshot, peopleSnapshot, groupsSnapshot, groupMembersSnapshot, usersSnapshot, userGroupsSnapshot, dutiesSnapshot, locationsSnapshot] = await Promise.all([
      get(ref(this.db, 'nets')),
      get(ref(this.db, 'people')),
      get(ref(this.db, 'groups')),
      get(ref(this.db, 'groupMembers')),
      get(ref(this.db, 'users')),
      get(ref(this.db, 'userGroups')),
      get(ref(this.db, 'duties')),
      get(ref(this.db, 'locations'))
    ]);

    const transformData = (snapshot: any) => {
      const data = snapshot.val();
      if (!data) return [];
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    };

    // Transform userGroups differently since it has a different structure
    const transformUserGroups = (snapshot: any) => {
      const data = snapshot.val();
      if (!data) return [];
      const result: any[] = [];
      Object.keys(data).forEach(email => {
        Object.keys(data[email]).forEach(groupName => {
          result.push({ email: email.replace(/,/g, '.'), groupName });
        });
      });
      return result;
    };

    return {
      nets: transformData(netsSnapshot),
      people: transformData(peopleSnapshot),
      groups: transformData(groupsSnapshot),
      groupMembers: transformData(groupMembersSnapshot),
      users: transformData(usersSnapshot),
      userGroups: transformUserGroups(userGroupsSnapshot),
      duties: transformData(dutiesSnapshot),
      locations: transformData(locationsSnapshot)
    };
  }

  private getDefaultEntry(): NetEntry {
    return {
      id: '',
      callsign: '',
      timeIn: '',
      name: '',
      duty: '',
      milageStart: 0,
      classification: '',
      timeOut: '',
      milageEnd: 0,
      firstName: '',
      lastName: '',
      classBoxA: '',
      classBoxB: '',
      wtr: '',
      classBoxD: '',
      classBoxE: '',
      classBoxF: '',
      classBoxG: '',
      classBoxH: '',
      headerName: '',
      footerInfo: ''
    };
  }

  // Reset all data and initialize with defaults
  async resetAllData(): Promise<void> {
    const ADMIN_EMAIL = 'matt.n3pay@gmail.com';
    const ADMIN_GROUP_NAME = 'DCARES';

    // Delete all collections
    await Promise.all([
      remove(ref(this.db, 'nets')),
      remove(ref(this.db, 'people')),
      remove(ref(this.db, 'groups')),
      remove(ref(this.db, 'groupMembers')),
      remove(ref(this.db, 'users')),
      remove(ref(this.db, 'userGroups')),
      remove(ref(this.db, 'duties')),
      remove(ref(this.db, 'locations'))
    ]);

    // Initialize users with admin user
    const sanitizedEmail = ADMIN_EMAIL.replace(/\./g, ',');
    await set(ref(this.db, `users/${sanitizedEmail}`), {
      email: ADMIN_EMAIL,
      displayName: 'Matt Payne',
      photoURL: '',
      lastLogin: Date.now()
    });

    // Initialize groups with DCARES
    const groupsRef = ref(this.db, 'groups');
    const newGroupRef = push(groupsRef);
    const groupId = newGroupRef.key || '';
    await set(newGroupRef, {
      name: ADMIN_GROUP_NAME,
      description: 'Douglas County ARES'
    });

    // Initialize groupMembers with admin in DCARES
    const membersRef = ref(this.db, 'groupMembers');
    const newMemberRef = push(membersRef);
    await set(newMemberRef, {
      groupId: groupId,
      email: ADMIN_EMAIL
    });

    // Initialize userGroups index for admin in DCARES
    await set(ref(this.db, `userGroups/${sanitizedEmail}/${ADMIN_GROUP_NAME}`), true);

    // Fetch and initialize people from members.json
    try {
      const response = await fetch('/members.json');
      const members: Operator[] = await response.json();

      const peopleRef = ref(this.db, 'people');
      for (const member of members) {
        const newPersonRef = push(peopleRef);
        await set(newPersonRef, {
          name: member.name,
          callsign: member.callsign,
          clubs: member.clubs || []
        });
      }
    } catch (error) {
      console.error('Error loading members.json:', error);
      throw new Error('Failed to load members.json for initialization');
    }

    // Clear the current net selection
    this.currentNetId = '';
    localStorage.removeItem('currentNetId');
  }
}
