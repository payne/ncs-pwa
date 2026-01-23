import { Injectable } from '@angular/core';
import { getDatabase, Database, ref, set, onValue, push, remove, update, off, get } from 'firebase/database';
import { NetEntry } from '../_models/net-entry.model';
import { Operator } from '../_models/operator.model';
import { Group, GroupMember } from '../_models/ncs-settings.model';
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

  createNet(netName: string): Promise<string> {
    const netsRef = ref(this.db, 'nets');
    const newNetRef = push(netsRef);
    const netId = newNetRef.key || '';

    return set(newNetRef, {
      name: netName,
      createdAt: Date.now(),
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
            createdAt: data[key].createdAt
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
    // First get all members of this group and delete them
    const membersRef = ref(this.db, 'groupMembers');
    const snapshot = await get(membersRef);
    const data = snapshot.val();

    if (data) {
      const deletePromises: Promise<void>[] = [];
      Object.keys(data).forEach(key => {
        if (data[key].groupId === groupId) {
          deletePromises.push(remove(ref(this.db, `groupMembers/${key}`)));
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

  addGroupMember(member: GroupMember): Promise<void> {
    const membersRef = ref(this.db, 'groupMembers');
    const newMemberRef = push(membersRef);
    return set(newMemberRef, {
      groupId: member.groupId,
      email: member.email
    });
  }

  deleteGroupMember(memberId: string): Promise<void> {
    const memberRef = ref(this.db, `groupMembers/${memberId}`);
    return remove(memberRef);
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
}
