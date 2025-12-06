import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Operator } from '../_models/operator.model';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {
  private membersUrl = '/members.json';

  constructor(private http: HttpClient) {}

  getOperators(): Observable<Operator[]> {
    return this.http.get<Operator[]>(this.membersUrl);
  }

  searchOperators(searchTerm: string, operators: Operator[]): Operator[] {
    if (!searchTerm || !searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();
    return operators.filter(operator =>
      operator.name.toLowerCase().includes(term) ||
      operator.callsign.toLowerCase().includes(term)
    );
  }
}
