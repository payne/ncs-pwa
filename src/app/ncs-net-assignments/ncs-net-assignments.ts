import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
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
import { OperatorService } from '../_services/operator.service';
import { StorageService } from '../_services/storage.service';
import { FirebaseService } from '../_services/firebase.service';
import { NetAssignment } from '../_models/ncs-net-assignments.model';
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
    MatDialogModule
  ],
  templateUrl: './ncs-net-assignments.html',
  styleUrl: './ncs-net-assignments.css',
})
export class NcsNetAssignments implements OnInit {
  assignmentForm!: FormGroup;
  dataSource!: MatTableDataSource<NetAssignment>;
  displayedColumns: string[] = ['callsign', 'timeIn', 'name', 'duty', 'milageStart', 'classification', 'timeOut', 'milageEnd', 'actions'];
  operators: Operator[] = [];
  filteredOperators: Operator[] = [];
  selectedOperatorIndex: number = 0;
  autocompleteOffset: number = 0;
  assignments: NetAssignment[] = [];
  duties: string[] = ['general', 'lead', 'scout', 'floater', 'unassigned'];
  classifications: string[] = ['full', 'partial', 'new', 'observer'];
  currentNetId: string = '';
  currentNetName: string = '';

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private operatorService: OperatorService,
    private storageService: StorageService,
    private firebaseService: FirebaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const savedNetId = localStorage.getItem('currentNetId');
    if (!savedNetId) {
      this.router.navigate(['/ncs-select-net']);
      return;
    }

    this.initializeForm();
    this.loadOperators();
    this.dataSource = new MatTableDataSource<NetAssignment>(this.assignments);
    this.configureSorting();

    this.selectNet(savedNetId);
  }

  configureSorting(): void {
    this.dataSource.sortingDataAccessor = (item: NetAssignment, property: string) => {
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

    this.firebaseService.getAssignments(netId).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.dataSource.data = this.assignments;
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.assignments;

    if (this.sort) {
      this.sort.active = 'timeIn';
      this.sort.direction = 'desc';
      this.dataSource.sort = this.sort;
    }
    this.cdr.detectChanges();
  }

  initializeForm(): void {
    const currentTime = this.getCurrentTime();
    this.assignmentForm = this.fb.group({
      callsign: ['', Validators.required],
      timeIn: [currentTime, Validators.required],
      name: ['', Validators.required],
      duty: ['unassigned', Validators.required],
      milageStart: [0, [Validators.required, Validators.min(0)]],
      classification: ['observer', Validators.required]
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
  }

  selectOperator(operator: Operator): void {
    this.assignmentForm.patchValue({
      callsign: operator.callsign,
      name: operator.name
    });
    this.filteredOperators = [];
    this.selectedOperatorIndex = 0;
    this.autocompleteOffset = 0;
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
    } else if (event.ctrlKey && event.key === 'n') {
      event.preventDefault();
      this.selectNextOperator();
    } else if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      this.selectPreviousOperator();
    }
  }

  addAssignment(): void {
    if (this.assignmentForm.valid && this.currentNetId) {
      const now = new Date();
      const timeInValue = this.assignmentForm.value.timeIn;
      const [hours, minutes] = timeInValue.split(':');
      now.setHours(parseInt(hours), parseInt(minutes), now.getSeconds(), now.getMilliseconds());

      const newAssignment: NetAssignment = {
        id: '',
        callsign: this.assignmentForm.value.callsign,
        timeIn: now.toISOString(),
        name: this.assignmentForm.value.name,
        duty: this.assignmentForm.value.duty,
        milageStart: this.assignmentForm.value.milageStart,
        classification: this.assignmentForm.value.classification,
        timeOut: '',
        milageEnd: 0,
        isEditing: false
      };

      this.firebaseService.addAssignment(this.currentNetId, newAssignment).then(() => {
        this.assignmentForm.reset();
        this.initializeForm();
      }).catch(error => {
        console.error('Error adding assignment:', error);
      });
    }
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

  enableEdit(assignment: NetAssignment): void {
    assignment.isEditing = true;
  }

  saveEdit(assignment: NetAssignment): void {
    assignment.isEditing = false;
    if (this.currentNetId && assignment.id) {
      this.firebaseService.updateAssignment(this.currentNetId, assignment.id, assignment).catch(error => {
        console.error('Error updating assignment:', error);
      });
    }
  }

  cancelEdit(assignment: NetAssignment): void {
    assignment.isEditing = false;
  }

  checkout(assignment: NetAssignment): void {
    const timeOut = this.getCurrentTime();
    if (this.currentNetId && assignment.id) {
      this.firebaseService.updateAssignment(this.currentNetId, assignment.id, { timeOut }).catch(error => {
        console.error('Error checking out assignment:', error);
      });
    }
  }

  deleteAssignment(assignment: NetAssignment): void {
    if (this.currentNetId && assignment.id) {
      this.firebaseService.deleteAssignment(this.currentNetId, assignment.id).catch(error => {
        console.error('Error deleting assignment:', error);
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
