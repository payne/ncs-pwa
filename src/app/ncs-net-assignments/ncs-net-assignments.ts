import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { OperatorService } from '../_services/operator.service';
import { StorageService } from '../_services/storage.service';
import { FirebaseService } from '../_services/firebase.service';
import { NetEntry } from '../_models/net-entry.model';
import { Operator } from '../_models/operator.model';

@Component({
  selector: 'app-ncs-net-assignments',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule
  ],
  templateUrl: './ncs-net-assignments.html',
  styleUrl: './ncs-net-assignments.css',
})
export class NcsNetAssignments implements OnInit {
  assignmentForm!: FormGroup;
  dataSource!: MatTableDataSource<any>;
  allColumns: { key: string; label: string; visible: boolean }[] = [
    { key: 'callsign', label: 'Callsign', visible: true },
    { key: 'timeIn', label: 'Time In', visible: true },
    { key: 'name', label: 'Name', visible: true },
    { key: 'duty', label: 'Duty', visible: true },
    { key: 'milageStart', label: 'Milage Start', visible: true },
    { key: 'classification', label: 'Classification', visible: true },
    { key: 'timeOut', label: 'Time Out', visible: true },
    { key: 'milageEnd', label: 'Milage End', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];
  operators: Operator[] = [];
  filteredOperators: Operator[] = [];
  selectedOperatorIndex: number = 0;
  autocompleteOffset: number = 0;
  selectedCallsignAlreadyAdded: boolean = false;
  entries: NetEntry[] = [];
  duties: string[] = ['general', 'lead', 'scout', 'floater', 'unassigned'];
  classifications: string[] = ['full', 'partial', 'new', 'observer'];
  lastDuty: string = 'unassigned';
  lastClassification: string = 'observer';
  currentNetId: string = '';
  currentNetName: string = '';
  addRowPlaceholder: any = { isAddRow: true };

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private operatorService: OperatorService,
    private storageService: StorageService,
    private firebaseService: FirebaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  get displayedColumns(): string[] {
    return this.allColumns.filter(col => col.visible).map(col => col.key);
  }

  toggleColumn(column: { key: string; label: string; visible: boolean }): void {
    column.visible = !column.visible;
  }

  ngOnInit(): void {
    const savedNetId = localStorage.getItem('currentNetId');
    if (!savedNetId) {
      this.router.navigate(['/ncs-select-net']);
      return;
    }

    this.initializeForm();
    this.loadOperators();
    this.dataSource = new MatTableDataSource<any>([this.addRowPlaceholder]);
    this.configureSorting();
    this.configureFilter();

    this.selectNet(savedNetId);
  }

  configureSorting(): void {
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'timeIn': return item.timeIn;
        case 'callsign': return item.callsign;
        case 'name': return item.name;
        case 'duty': return item.duty;
        case 'milageStart': return item.milageStart;
        case 'classification': return item.classification;
        case 'timeOut': return item.timeOut;
        case 'milageEnd': return item.milageEnd;
        default: return '';
      }
    };

    // Override sortData to keep add row always at top
    const defaultSort = this.dataSource.sortData;
    this.dataSource.sortData = (data: any[], sort: MatSort) => {
      const addRow = data.find(item => item.isAddRow);
      const otherRows = data.filter(item => !item.isAddRow);
      const sortedRows = defaultSort.call(this.dataSource, otherRows, sort);
      return addRow ? [addRow, ...sortedRows] : sortedRows;
    };
  }

  configureFilter(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      if (data.isAddRow) return true;
      const dataStr = [
        data.callsign,
        data.name,
        data.duty,
        data.classification
      ].join(' ').toLowerCase();
      return dataStr.includes(filter);
    };
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (this.assignmentForm.valid) {
        this.addAssignment();
      }
    }
  }

  selectNet(netId: string): void {
    this.currentNetId = netId;
    this.firebaseService.setCurrentNet(netId);
    localStorage.setItem('currentNetId', netId);

    this.firebaseService.getNets().subscribe({
      next: (nets) => {
        const net = nets.find(n => n.id === netId);
        if (net) {
          this.currentNetName = net.name;
        }
      }
    });

    this.firebaseService.getEntries(netId).subscribe({
      next: (entries) => {
        this.entries = entries;
        this.dataSource.data = [this.addRowPlaceholder, ...this.entries];
      },
      error: (error) => {
        console.error('Error loading entries:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.data = [this.addRowPlaceholder, ...this.entries];

    if (this.sort) {
      this.sort.active = 'timeIn';
      this.sort.direction = 'desc';
      this.dataSource.sort = this.sort;
    }
    this.cdr.detectChanges();
  }

  initializeForm(): void {
    this.assignmentForm = this.fb.group({
      callsign: ['', Validators.required],
      timeIn: [''],
      name: ['', Validators.required],
      duty: [this.lastDuty, Validators.required],
      milageStart: [0, [Validators.required, Validators.min(0)]],
      classification: [this.lastClassification, Validators.required]
    });
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  loadOperators(): void {
    this.operatorService.getOperators().subscribe({
      next: (operators) => {
        this.operators = operators;
      },
      error: (error) => {
        console.error('Error loading operators:', error);
      }
    });
  }

  onSearchOperator(searchValue: string): void {
    this.filteredOperators = this.operatorService.searchOperators(searchValue, this.operators);
    this.selectedOperatorIndex = 0;
    this.autocompleteOffset = 0;
    this.selectedCallsignAlreadyAdded = false;
  }

  isCallsignAlreadyAdded(callsign: string): boolean {
    return this.entries.some(entry =>
      entry.callsign.toLowerCase() === callsign.toLowerCase() && !entry.timeOut
    );
  }

  selectOperator(operator: Operator): void {
    const alreadyAdded = this.isCallsignAlreadyAdded(operator.callsign);

    if (alreadyAdded) {
      this.selectedCallsignAlreadyAdded = true;
      return;
    }

    this.assignmentForm.patchValue({
      callsign: operator.callsign,
      name: operator.name
    });
    this.filteredOperators = [];
    this.selectedOperatorIndex = 0;
    this.autocompleteOffset = 0;
    this.selectedCallsignAlreadyAdded = false;

    // Focus the add button so user can press Enter to add
    setTimeout(() => {
      const addButton = this.elementRef.nativeElement.querySelector('.add-row button');
      if (addButton) {
        addButton.focus();
      }
    });
  }

  selectNextOperator(): void {
    if (this.filteredOperators.length === 0) return;

    const currentPage = this.filteredOperators.slice(this.autocompleteOffset, this.autocompleteOffset + 4);

    if (this.selectedOperatorIndex < currentPage.length - 1) {
      this.selectedOperatorIndex++;
    } else if (this.autocompleteOffset + 4 < this.filteredOperators.length) {
      this.autocompleteOffset += 4;
      this.selectedOperatorIndex = 0;
    } else {
      this.autocompleteOffset = 0;
      this.selectedOperatorIndex = 0;
    }
  }

  selectPreviousOperator(): void {
    if (this.filteredOperators.length === 0) return;

    if (this.selectedOperatorIndex > 0) {
      this.selectedOperatorIndex--;
    } else if (this.autocompleteOffset > 0) {
      this.autocompleteOffset -= 4;
      this.selectedOperatorIndex = 3;
    } else {
      const lastPageOffset = Math.floor((this.filteredOperators.length - 1) / 4) * 4;
      this.autocompleteOffset = lastPageOffset;
      this.selectedOperatorIndex = Math.min(3, this.filteredOperators.length - lastPageOffset - 1);
    }
  }

  selectCurrentOperator(): void {
    const actualIndex = this.autocompleteOffset + this.selectedOperatorIndex;
    if (this.filteredOperators.length > 0 && actualIndex < this.filteredOperators.length) {
      this.selectOperator(this.filteredOperators[actualIndex]);
    }
  }

  onCallsignKeydown(event: KeyboardEvent): void {
    if (this.filteredOperators.length === 0) return;

    if (event.key === 'Tab') {
      event.preventDefault();
      this.selectCurrentOperator();
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.selectCurrentOperator();
    } else if (event.key === 'ArrowDown' || (event.ctrlKey && event.key === 'n')) {
      event.preventDefault();
      this.selectNextOperator();
    } else if (event.key === 'ArrowUp' || (event.ctrlKey && event.key === 'p')) {
      event.preventDefault();
      this.selectPreviousOperator();
    }
  }

  addAssignment(): void {
    if (this.assignmentForm.valid && this.currentNetId) {
      const callsign = this.assignmentForm.value.callsign;

      if (this.isCallsignAlreadyAdded(callsign)) {
        console.warn('Callsign already added:', callsign);
        return;
      }

      const now = new Date();
      const timeInValue = this.assignmentForm.value.timeIn;
      if (timeInValue) {
        const [hours, minutes] = timeInValue.split(':');
        now.setHours(parseInt(hours), parseInt(minutes), now.getSeconds(), now.getMilliseconds());
      }

      this.lastDuty = this.assignmentForm.value.duty;
      this.lastClassification = this.assignmentForm.value.classification;

      const nameParts = this.assignmentForm.value.name.split(' ');
      const newEntry: Partial<NetEntry> = {
        callsign: callsign,
        timeIn: now.toISOString(),
        name: this.assignmentForm.value.name,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        duty: this.assignmentForm.value.duty,
        milageStart: this.assignmentForm.value.milageStart,
        classification: this.assignmentForm.value.classification,
        timeOut: '',
        milageEnd: 0
      };

      this.firebaseService.addEntry(this.currentNetId, newEntry).then(() => {
        this.assignmentForm.reset();
        this.initializeForm();
        this.focusCallsignInput();
      }).catch(error => {
        console.error('Error adding entry:', error);
      });
    }
  }

  focusCallsignInput(): void {
    setTimeout(() => {
      const callsignInput = this.elementRef.nativeElement.querySelector('.add-row input');
      if (callsignInput) {
        callsignInput.focus();
      }
    });
  }

  formatTimeIn(timeIn: string): string {
    if (!timeIn) return '';
    try {
      const date = new Date(timeIn);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return timeIn;
    }
  }

  enableEdit(entry: NetEntry): void {
    entry.isEditing = true;
  }

  saveEdit(entry: NetEntry): void {
    entry.isEditing = false;
    if (this.currentNetId && entry.id) {
      this.firebaseService.updateEntry(this.currentNetId, entry.id, entry).catch(error => {
        console.error('Error updating entry:', error);
      });
    }
  }

  cancelEdit(entry: NetEntry): void {
    entry.isEditing = false;
  }

  checkout(entry: NetEntry): void {
    const timeOut = this.getCurrentTime();
    if (this.currentNetId && entry.id) {
      this.firebaseService.updateEntry(this.currentNetId, entry.id, { timeOut }).catch(error => {
        console.error('Error checking out entry:', error);
      });
    }
  }

  deleteAssignment(entry: NetEntry): void {
    if (this.currentNetId && entry.id) {
      this.firebaseService.deleteEntry(this.currentNetId, entry.id).catch(error => {
        console.error('Error deleting entry:', error);
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  downloadCsv(): void {
    const visibleColumns = this.allColumns.filter(col => col.visible && col.key !== 'actions');
    const headers = visibleColumns.map(col => col.label);

    const rows = this.entries.map(entry => {
      return visibleColumns.map(col => {
        let value = (entry as any)[col.key];
        if (col.key === 'timeIn' || col.key === 'timeOut') {
          value = col.key === 'timeIn' ? this.formatTimeIn(value) : value;
        }
        if (value === null || value === undefined) value = '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    const filename = `net-assignments-${this.currentNetName || 'export'}-${date}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
