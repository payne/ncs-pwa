import { Injectable } from '@angular/core';
import { getDatabase, Database, ref, set, onValue, push, remove, update, off } from 'firebase/database';
import { NetAssignment } from '../_models/ncs-net-assignments.model';
import { View2Entry } from '../_models/ncs-view2.model';
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

  getAssignments(netId: string): Observable<NetAssignment[]> {
    return new Observable(observer => {
      const assignmentsRef = ref(this.db, `nets/${netId}/assignments`);

      const unsubscribe = onValue(assignmentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const assignments: NetAssignment[] = Object.keys(data).map(key => ({
            ...data[key],
            id: key
          }));
          observer.next(assignments);
        } else {
          observer.next([]);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => {
        off(assignmentsRef);
      };
    });
  }

  addAssignment(netId: string, assignment: NetAssignment): Promise<void> {
    const assignmentsRef = ref(this.db, `nets/${netId}/assignments`);
    const newAssignmentRef = push(assignmentsRef);
    const { id, ...assignmentWithoutId } = assignment;
    return set(newAssignmentRef, assignmentWithoutId);
  }

  updateAssignment(netId: string, assignmentId: string, assignment: Partial<NetAssignment>): Promise<void> {
    const assignmentRef = ref(this.db, `nets/${netId}/assignments/${assignmentId}`);
    const { id, ...updateData } = assignment;
    return update(assignmentRef, updateData);
  }

  deleteAssignment(netId: string, assignmentId: string): Promise<void> {
    const assignmentRef = ref(this.db, `nets/${netId}/assignments/${assignmentId}`);
    return remove(assignmentRef);
  }

  createNet(netName: string): Promise<string> {
    const netsRef = ref(this.db, 'nets');
    const newNetRef = push(netsRef);
    const netId = newNetRef.key || '';

    return set(newNetRef, {
      name: netName,
      createdAt: Date.now(),
      assignments: {}
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

  getView2Entries(netId: string): Observable<View2Entry[]> {
    return new Observable(observer => {
      const entriesRef = ref(this.db, `nets/${netId}/view2Entries`);

      const unsubscribe = onValue(entriesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const entries: View2Entry[] = Object.keys(data).map(key => ({
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

  addView2Entry(netId: string, entry: View2Entry): Promise<void> {
    const entriesRef = ref(this.db, `nets/${netId}/view2Entries`);
    const newEntryRef = push(entriesRef);
    const { id, ...entryWithoutId } = entry;
    return set(newEntryRef, entryWithoutId);
  }

  updateView2Entry(netId: string, entryId: string, entry: Partial<View2Entry>): Promise<void> {
    const entryRef = ref(this.db, `nets/${netId}/view2Entries/${entryId}`);
    const { id, ...updateData } = entry;
    return update(entryRef, updateData);
  }

  deleteView2Entry(netId: string, entryId: string): Promise<void> {
    const entryRef = ref(this.db, `nets/${netId}/view2Entries/${entryId}`);
    return remove(entryRef);
  }
}
