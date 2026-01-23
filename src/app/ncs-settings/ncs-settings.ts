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
import { FirebaseService } from '../_services/firebase.service';
import { Group, GroupMember, EditableGroup } from '../_models/ncs-settings.model';

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
    MatChipsModule
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

  @ViewChild('groupSort') groupSort!: MatSort;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.groupDataSource = new MatTableDataSource<EditableGroup>([this.addGroupPlaceholder]);
    this.loadGroups();
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
}
