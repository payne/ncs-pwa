import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../_services/firebase.service';
import { PermissionService } from '../_services/permission.service';
import { MainViewEntry, MainViewHeader } from '../_models/ncs-main-view.model';

interface EditableEntry extends MainViewEntry {
  isNew?: boolean;
}

@Component({
  selector: 'app-ncs-main-view',
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
    MatSelectModule
  ],
  templateUrl: './ncs-main-view.html',
  styleUrl: './ncs-main-view.css',
})
export class NcsMainView implements OnInit, OnDestroy {
  displayedColumns: string[] = ['call', 'first', 'lastInitial', 'assignment1', 'status1', 'status2', 'status3', 'status4', 'actions'];
  dataSource!: MatTableDataSource<EditableEntry>;
  entries: EditableEntry[] = [];
  addEntryPlaceholder: EditableEntry = this.createEmptyEntry();

  // Header fields
  header: MainViewHeader = {
    netControlOp: '',
    type: '',
    netOpened: '',
    reasonForNet: '',
    comments: ''
  };

  netTypes: string[] = ['Training', 'Emergency', 'Weekly', 'Special Event', 'Drill'];

  currentNetId: string = '';
  currentNetName: string = '';
  canEdit: boolean = false;

  // Autocomplete for callsign
  people: any[] = [];
  filteredPeople: any[] = [];
  showAutocomplete: boolean = false;
  selectedAutocompleteIndex: number = -1;

  private entriesSubscription?: Subscription;
  private peopleSubscription?: Subscription;
  private headerSubscription?: Subscription;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private firebaseService: FirebaseService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const savedNetId = localStorage.getItem('currentNetId');
    if (!savedNetId) {
      this.router.navigate(['/ncs-select-net']);
      return;
    }

    this.dataSource = new MatTableDataSource<EditableEntry>([this.addEntryPlaceholder]);
    this.loadPeople();
    this.selectNet(savedNetId);
  }

  ngOnDestroy(): void {
    this.entriesSubscription?.unsubscribe();
    this.peopleSubscription?.unsubscribe();
    this.headerSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.configureSorting();
  }

  createEmptyEntry(): EditableEntry {
    return {
      isNew: true,
      call: '',
      first: '',
      lastInitial: '',
      assignment1: '',
      status1: '',
      status2: '',
      status3: '',
      status4: ''
    };
  }

  loadPeople(): void {
    this.peopleSubscription = this.firebaseService.getPeople().subscribe({
      next: (people) => {
        this.people = people;
      },
      error: (error) => {
        console.error('Error loading people:', error);
      }
    });
  }

  async selectNet(netId: string): Promise<void> {
    this.currentNetId = netId;
    this.firebaseService.setCurrentNet(netId);

    // Check if user can edit this NET
    this.canEdit = await this.permissionService.canAccessNet(netId);

    // Get net name
    this.firebaseService.getNets().subscribe({
      next: (nets) => {
        const net = nets.find(n => n.id === netId);
        if (net) {
          this.currentNetName = net.name;
        }
      }
    });

    this.loadEntries();
    this.loadHeader();
  }

  loadEntries(): void {
    if (!this.currentNetId) return;

    this.entriesSubscription?.unsubscribe();
    this.entriesSubscription = this.firebaseService.getMainViewEntries(this.currentNetId).subscribe({
      next: (entries) => {
        this.entries = entries;
        this.updateDataSource();
      },
      error: (error) => {
        console.error('Error loading entries:', error);
      }
    });
  }

  private updateDataSource(): void {
    if (this.canEdit) {
      this.dataSource.data = [this.addEntryPlaceholder, ...this.entries];
    } else {
      this.dataSource.data = [...this.entries];
    }
  }

  loadHeader(): void {
    if (!this.currentNetId) return;

    this.headerSubscription?.unsubscribe();
    this.headerSubscription = this.firebaseService.getMainViewHeader(this.currentNetId).subscribe({
      next: (header) => {
        if (header) {
          this.header = header;
        } else {
          this.resetHeader();
        }
      },
      error: (error) => {
        console.error('Error loading header:', error);
      }
    });
  }

  resetHeader(): void {
    this.header = {
      netControlOp: '',
      type: '',
      netOpened: '',
      reasonForNet: '',
      comments: ''
    };
  }

  configureSorting(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }

    this.dataSource.sortingDataAccessor = (item: EditableEntry, property: string) => {
      return (item as any)[property] || '';
    };

    const defaultSort = this.dataSource.sortData;
    this.dataSource.sortData = (data: EditableEntry[], sort: MatSort) => {
      const addRow = data.find(item => item.isNew);
      const otherRows = data.filter(item => !item.isNew);
      const sortedRows = defaultSort.call(this.dataSource, otherRows, sort);
      return addRow ? [addRow, ...sortedRows] : sortedRows;
    };
  }

  // Header actions
  startNewNet(): void {
    if (!this.canEdit) return;
    const now = new Date();
    this.header.netOpened = now.toLocaleString();
    this.saveHeader();
  }

  saveHeader(): void {
    if (!this.currentNetId || !this.canEdit) return;
    this.firebaseService.saveMainViewHeader(this.currentNetId, this.header).catch(error => {
      console.error('Error saving header:', error);
    });
  }

  onHeaderFieldBlur(): void {
    this.saveHeader();
  }

  // Callsign autocomplete
  onCallsignInput(value: string): void {
    if (!value) {
      this.filteredPeople = [];
      this.showAutocomplete = false;
      return;
    }

    const searchValue = value.toUpperCase();
    this.filteredPeople = this.people.filter(p =>
      p.callsign?.toUpperCase().startsWith(searchValue)
    ).slice(0, 10);

    this.showAutocomplete = this.filteredPeople.length > 0;
    this.selectedAutocompleteIndex = this.filteredPeople.length > 0 ? 0 : -1;
  }

  onCallsignKeydown(event: KeyboardEvent): void {
    if (!this.showAutocomplete) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedAutocompleteIndex = Math.min(
        this.selectedAutocompleteIndex + 1,
        this.filteredPeople.length - 1
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedAutocompleteIndex = Math.max(this.selectedAutocompleteIndex - 1, 0);
    } else if (event.key === 'Enter' && this.selectedAutocompleteIndex >= 0) {
      event.preventDefault();
      this.selectPerson(this.filteredPeople[this.selectedAutocompleteIndex]);
    } else if (event.key === 'Escape') {
      this.showAutocomplete = false;
    }
  }

  selectPerson(person: any): void {
    this.addEntryPlaceholder.call = person.callsign || '';
    // Parse name - assuming format "First Last"
    const nameParts = (person.name || '').split(' ');
    this.addEntryPlaceholder.first = nameParts[0] || '';
    this.addEntryPlaceholder.lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() : '';
    this.showAutocomplete = false;
    this.addEntry();
  }

  hideAutocomplete(): void {
    setTimeout(() => {
      this.showAutocomplete = false;
    }, 200);
  }

  // Entry CRUD
  addEntry(): void {
    if (!this.canEdit) return;

    const call = this.addEntryPlaceholder.call?.trim().toUpperCase();
    if (!call) return;

    const newEntry: MainViewEntry = {
      call: call,
      first: this.addEntryPlaceholder.first || '',
      lastInitial: this.addEntryPlaceholder.lastInitial || '',
      assignment1: this.addEntryPlaceholder.assignment1 || '',
      status1: this.addEntryPlaceholder.status1 || '',
      status2: this.addEntryPlaceholder.status2 || '',
      status3: this.addEntryPlaceholder.status3 || '',
      status4: this.addEntryPlaceholder.status4 || '',
      timeIn: new Date().toLocaleTimeString()
    };

    this.firebaseService.addMainViewEntry(this.currentNetId, newEntry).then(() => {
      this.addEntryPlaceholder = this.createEmptyEntry();
    }).catch(error => {
      console.error('Error adding entry:', error);
    });
  }

  onCellBlur(entry: EditableEntry, field: string, value: string): void {
    if (entry.isNew || !this.canEdit) return;

    const currentValue = (entry as any)[field];
    if (currentValue !== value) {
      (entry as any)[field] = value;
      this.saveEntry(entry);
    }
  }

  saveEntry(entry: EditableEntry): void {
    if (entry.id && this.currentNetId) {
      const updateData: Partial<MainViewEntry> = {
        call: entry.call,
        first: entry.first,
        lastInitial: entry.lastInitial,
        assignment1: entry.assignment1,
        status1: entry.status1,
        status2: entry.status2,
        status3: entry.status3,
        status4: entry.status4
      };
      this.firebaseService.updateMainViewEntry(this.currentNetId, entry.id, updateData).catch(error => {
        console.error('Error saving entry:', error);
      });
    }
  }

  deleteEntry(entry: EditableEntry): void {
    if (entry.id && this.currentNetId && this.canEdit) {
      this.firebaseService.deleteMainViewEntry(this.currentNetId, entry.id).catch(error => {
        console.error('Error deleting entry:', error);
      });
    }
  }

  // Status color helper
  getStatusClass(status: string): string {
    if (!status) return '';
    const letter = status.toUpperCase().charAt(0);
    switch (letter) {
      case 'P': return 'status-present';      // Green - Present
      case 'A': return 'status-absent';       // Red - Absent
      case 'L': return 'status-late';         // Yellow - Late
      case 'E': return 'status-excused';      // Blue - Excused
      case 'X': return 'status-checked-out';  // Gray - Checked out
      default: return '';
    }
  }
}
