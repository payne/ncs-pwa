import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'ncs_net_assignments';

  saveAssignments(assignments: any[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  loadAssignments(): any[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  clearAssignments(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
