import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Operator } from '../_models/operator.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {
  private membersUrl = '/members.json';
  private syncCompleted = false;

  constructor(
    private http: HttpClient,
    private firebaseService: FirebaseService
  ) {
    this.syncMembersToFirebase();
  }

  getOperators(): Observable<Operator[]> {
    return this.firebaseService.getPeople();
  }

  searchOperators(searchTerm: string, operators: Operator[]): Operator[] {
    if (!searchTerm || !searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();
    return operators
      .filter(operator =>
        operator.name.toLowerCase().includes(term) ||
        operator.callsign.toLowerCase().includes(term)
      )
      .sort((a, b) => a.callsign.localeCompare(b.callsign));
  }

  private async syncMembersToFirebase(): Promise<void> {
    if (this.syncCompleted) return;

    try {
      // Load members from JSON file
      const membersJson = await firstValueFrom(this.http.get<Operator[]>(this.membersUrl));

      // Load existing people from Firebase
      const firebasePeople = await this.firebaseService.getPeopleOnce();

      // Create a Set of callsigns in Firebase for quick lookup (case-insensitive)
      const firebaseCallsigns = new Set(
        firebasePeople
          .filter(p => p.callsign)
          .map(p => p.callsign.toUpperCase())
      );

      // Create a Set of callsigns in members.json for comparison
      const membersCallsigns = new Set(
        membersJson
          .filter(m => m.callsign)
          .map(m => m.callsign.toUpperCase())
      );

      // Add people from members.json that don't exist in Firebase
      let addedCount = 0;
      for (const member of membersJson) {
        if (member.callsign && !firebaseCallsigns.has(member.callsign.toUpperCase())) {
          await this.firebaseService.addPerson(member);
          addedCount++;
          console.log(`Added to Firebase: ${member.callsign} - ${member.name}`);
        }
      }

      if (addedCount > 0) {
        console.log(`Sync complete: Added ${addedCount} people from members.json to Firebase`);
      }

      // Log people in Firebase but not in members.json
      for (const person of firebasePeople) {
        if (person.callsign && !membersCallsigns.has(person.callsign.toUpperCase())) {
          console.log(`In Firebase but not in members.json: ${person.callsign} - ${person.name}`);
        }
      }

      this.syncCompleted = true;
    } catch (error) {
      console.error('Error syncing members to Firebase:', error);
    }
  }
}
