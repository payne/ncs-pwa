import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { OperatorService } from '../_services/operator.service';
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
    MatTooltipModule
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
  assignments: NetAssignment[] = [];
  duties: string[] = ['general', 'lead', 'scout', 'floater', 'unassigned'];
  classifications: string[] = ['full', 'partial', 'new', 'observer'];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private operatorService: OperatorService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadOperators();
    this.dataSource = new MatTableDataSource<NetAssignment>(this.assignments);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
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
  }

  selectOperator(operator: Operator): void {
    this.assignmentForm.patchValue({
      callsign: operator.callsign,
      name: operator.name
    });
    this.filteredOperators = [];
  }

  addAssignment(): void {
    if (this.assignmentForm.valid) {
      const newAssignment: NetAssignment = {
        id: this.generateId(),
        callsign: this.assignmentForm.value.callsign,
        timeIn: this.assignmentForm.value.timeIn,
        name: this.assignmentForm.value.name,
        duty: this.assignmentForm.value.duty,
        milageStart: this.assignmentForm.value.milageStart,
        classification: this.assignmentForm.value.classification,
        timeOut: '',
        milageEnd: 0,
        isEditing: false
      };

      this.assignments.unshift(newAssignment);
      this.dataSource.data = this.assignments;
      this.assignmentForm.reset();
    }
  }

  enableEdit(assignment: NetAssignment): void {
    assignment.isEditing = true;
  }

  saveEdit(assignment: NetAssignment): void {
    assignment.isEditing = false;
  }

  cancelEdit(assignment: NetAssignment): void {
    assignment.isEditing = false;
  }

  checkout(assignment: NetAssignment): void {
    assignment.timeOut = this.getCurrentTime();
  }

  deleteAssignment(assignment: NetAssignment): void {
    const index = this.assignments.findIndex(a => a.id === assignment.id);
    if (index !== -1) {
      this.assignments.splice(index, 1);
      this.dataSource.data = this.assignments;
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
