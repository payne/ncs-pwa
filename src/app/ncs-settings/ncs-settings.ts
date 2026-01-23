import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FirebaseService } from '../_services/firebase.service';
import { Group, GroupMember, EditableGroup, AppUser } from '../_models/ncs-settings.model';
import JSZip from 'jszip';

@Component({
  selector: 'app-ncs-settings',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatMenuModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ncs-settings.html',
  styleUrl: './ncs-settings.css',
})
export class NcsSettings implements OnInit {
  // Groups table
  groupDisplayedColumns: string[] = ['name', 'description', 'actions'];
  groupDataSource!: MatTableDataSource<EditableGroup>;
  groups: EditableGroup[] = [];
  addGroupPlaceholder: EditableGroup = { isNew: true, name: '', description: '' };
  groupNameError: string = '';

  // Group members management
  selectedGroupId: string = '';
  selectedGroupName: string = '';
  groupMembers: GroupMember[] = [];
  newMemberEmail: string = '';
  memberEmailError: string = '';

  // Known users for autocomplete
  knownUsers: AppUser[] = [];
  filteredUsers: AppUser[] = [];

  // Backup
  backupFormat: 'json' | 'csv' = 'json';
  isBackingUp: boolean = false;
  backupError: string = '';

  // Reset
  isResetting: boolean = false;
  resetError: string = '';
  showResetConfirm: boolean = false;

  @ViewChild('groupSort') groupSort!: MatSort;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.groupDataSource = new MatTableDataSource<EditableGroup>([this.addGroupPlaceholder]);
    this.loadGroups();
    this.loadUsers();
  }

  loadUsers(): void {
    this.firebaseService.getUsers().subscribe({
      next: (users) => {
        this.knownUsers = users;
        this.filterUsers();
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  filterUsers(): void {
    const filterValue = this.newMemberEmail?.toLowerCase() || '';
    // Filter out users already in the group
    const memberEmails = this.groupMembers.map(m => m.email.toLowerCase());
    this.filteredUsers = this.knownUsers.filter(user =>
      !memberEmails.includes(user.email.toLowerCase()) &&
      (user.email.toLowerCase().includes(filterValue) ||
       user.displayName.toLowerCase().includes(filterValue))
    );
  }

  onUserInputChange(): void {
    this.filterUsers();
    this.memberEmailError = '';
  }

  ngAfterViewInit(): void {
    this.configureGroupSorting();
  }

  // --- Groups CRUD ---

  loadGroups(): void {
    this.firebaseService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.groupDataSource.data = [this.addGroupPlaceholder, ...this.groups];
        if (this.groupSort) {
          this.groupDataSource.sort = this.groupSort;
        }
      },
      error: (error) => {
        console.error('Error loading groups:', error);
      }
    });
  }

  configureGroupSorting(): void {
    if (this.groupSort) {
      this.groupDataSource.sort = this.groupSort;
    }

    this.groupDataSource.sortingDataAccessor = (item: EditableGroup, property: string) => {
      return (item as any)[property] || '';
    };

    const defaultSort = this.groupDataSource.sortData;
    this.groupDataSource.sortData = (data: EditableGroup[], sort: MatSort) => {
      const addRow = data.find(item => item.isNew);
      const otherRows = data.filter(item => !item.isNew);
      const sortedRows = defaultSort.call(this.groupDataSource, otherRows, sort);
      return addRow ? [addRow, ...sortedRows] : sortedRows;
    };
  }

  isGroupNameDuplicate(name: string, excludeId?: string): boolean {
    const normalizedName = name.trim().toLowerCase();
    return this.groups.some(g =>
      g.name.trim().toLowerCase() === normalizedName && g.id !== excludeId
    );
  }

  onGroupCellBlur(group: EditableGroup, field: string, value: string): void {
    if (group.isNew) return;

    const currentValue = (group as any)[field];
    if (currentValue !== value) {
      if (field === 'name') {
        if (this.isGroupNameDuplicate(value, group.id)) {
          this.groupNameError = 'A group with this name already exists';
          return;
        }
        this.groupNameError = '';
      }
      (group as any)[field] = value;
      this.saveGroup(group);
    }
  }

  saveGroup(group: EditableGroup): void {
    if (group.id) {
      this.firebaseService.updateGroup(group.id, {
        name: group.name,
        description: group.description
      }).catch(error => {
        console.error('Error saving group:', error);
      });
    }
  }

  addGroup(): void {
    const name = this.addGroupPlaceholder.name?.trim();
    const description = this.addGroupPlaceholder.description?.trim();

    if (!name) {
      this.groupNameError = 'Group name is required';
      return;
    }

    if (this.isGroupNameDuplicate(name)) {
      this.groupNameError = 'A group with this name already exists';
      return;
    }

    this.groupNameError = '';

    const newGroup: Group = {
      name: name,
      description: description || ''
    };

    this.firebaseService.addGroup(newGroup).then(() => {
      this.addGroupPlaceholder = { isNew: true, name: '', description: '' };
    }).catch(error => {
      console.error('Error adding group:', error);
    });
  }

  deleteGroup(group: EditableGroup): void {
    if (group.id) {
      // Also delete all members of this group
      this.firebaseService.deleteGroupWithMembers(group.id).catch(error => {
        console.error('Error deleting group:', error);
      });

      // Clear selection if this group was selected
      if (this.selectedGroupId === group.id) {
        this.selectedGroupId = '';
        this.selectedGroupName = '';
        this.groupMembers = [];
      }
    }
  }

  applyGroupFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.groupDataSource.filter = filterValue.trim().toLowerCase();
  }

  // --- Group Members Management ---

  selectGroup(group: EditableGroup): void {
    if (group.isNew || !group.id) return;

    this.selectedGroupId = group.id;
    this.selectedGroupName = group.name;
    this.loadGroupMembers();
  }

  loadGroupMembers(): void {
    if (!this.selectedGroupId) return;

    this.firebaseService.getGroupMembers(this.selectedGroupId).subscribe({
      next: (members) => {
        this.groupMembers = members;
        this.filterUsers();
      },
      error: (error) => {
        console.error('Error loading group members:', error);
      }
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isMemberDuplicate(email: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    return this.groupMembers.some(m => m.email.toLowerCase() === normalizedEmail);
  }

  addMember(): void {
    const email = this.newMemberEmail?.trim();

    if (!email) {
      this.memberEmailError = 'Email is required';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.memberEmailError = 'Please enter a valid email address';
      return;
    }

    if (this.isMemberDuplicate(email)) {
      this.memberEmailError = 'This user is already in the group';
      return;
    }

    this.memberEmailError = '';

    const newMember: GroupMember = {
      groupId: this.selectedGroupId,
      email: email.toLowerCase()
    };

    this.firebaseService.addGroupMember(newMember).then(() => {
      this.newMemberEmail = '';
      this.filterUsers();
    }).catch(error => {
      console.error('Error adding member:', error);
    });
  }

  removeMember(member: GroupMember): void {
    if (member.id) {
      this.firebaseService.deleteGroupMember(member.id).catch(error => {
        console.error('Error removing member:', error);
      });
    }
  }

  clearGroupSelection(): void {
    this.selectedGroupId = '';
    this.selectedGroupName = '';
    this.groupMembers = [];
    this.newMemberEmail = '';
    this.memberEmailError = '';
  }

  // --- Backup ---

  async downloadBackup(): Promise<void> {
    this.isBackingUp = true;
    this.backupError = '';

    try {
      const data = await this.firebaseService.getAllDataForBackup();
      const zip = new JSZip();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      if (this.backupFormat === 'json') {
        // Add JSON files
        zip.file('nets.json', JSON.stringify(data.nets, null, 2));
        zip.file('people.json', JSON.stringify(data.people, null, 2));
        zip.file('groups.json', JSON.stringify(data.groups, null, 2));
        zip.file('groupMembers.json', JSON.stringify(data.groupMembers, null, 2));
        zip.file('users.json', JSON.stringify(data.users, null, 2));
        zip.file('userGroups.json', JSON.stringify(data.userGroups, null, 2));
        zip.file('duties.json', JSON.stringify(data.duties, null, 2));
        zip.file('locations.json', JSON.stringify(data.locations, null, 2));
      } else {
        // Add CSV files
        zip.file('nets.csv', this.convertToCSV(data.nets));
        zip.file('people.csv', this.convertToCSV(data.people));
        zip.file('groups.csv', this.convertToCSV(data.groups));
        zip.file('groupMembers.csv', this.convertToCSV(data.groupMembers));
        zip.file('users.csv', this.convertToCSV(data.users));
        zip.file('userGroups.csv', this.convertToCSV(data.userGroups));
        zip.file('duties.csv', this.convertToCSV(data.duties));
        zip.file('locations.csv', this.convertToCSV(data.locations));

        // For nets with entries, create separate CSV files
        for (const net of data.nets) {
          if (net.entries) {
            const entries = Object.keys(net.entries).map(key => ({
              id: key,
              ...net.entries[key]
            }));
            if (entries.length > 0) {
              const safeName = net.name?.replace(/[^a-zA-Z0-9]/g, '_') || net.id;
              zip.file(`net_entries_${safeName}.csv`, this.convertToCSV(entries));
            }
          }
        }
      }

      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ncs-backup-${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating backup:', error);
      this.backupError = 'Failed to create backup. Please try again.';
    } finally {
      this.isBackingUp = false;
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        // Skip nested objects like 'entries' in nets
        if (typeof item[key] !== 'object' || item[key] === null) {
          allKeys.add(key);
        }
      });
    });

    const headers = Array.from(allKeys);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.map(h => this.escapeCSV(h)).join(','));

    // Data rows
    for (const item of data) {
      const values = headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) {
          return '';
        }
        if (Array.isArray(value)) {
          return this.escapeCSV(value.join('; '));
        }
        return this.escapeCSV(String(value));
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // --- Reset Data ---

  toggleResetConfirm(): void {
    this.showResetConfirm = !this.showResetConfirm;
    this.resetError = '';
  }

  async resetAllData(): Promise<void> {
    this.isResetting = true;
    this.resetError = '';

    try {
      await this.firebaseService.resetAllData();
      this.showResetConfirm = false;
      // Reload the page to refresh all data
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
      this.resetError = 'Failed to reset data. Please try again.';
    } finally {
      this.isResetting = false;
    }
  }
}
