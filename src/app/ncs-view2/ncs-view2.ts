import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FirebaseService } from '../_services/firebase.service';
import { View2Entry } from '../_models/ncs-view2.model';

@Component({
  selector: 'app-ncs-view2',
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
    MatTooltipModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  templateUrl: './ncs-view2.html',
  styleUrl: './ncs-view2.css',
})
export class NcsView2 implements OnInit {
  entryForm!: FormGroup;
  dataSource!: MatTableDataSource<any>;
  allColumns: { key: string; label: string; visible: boolean }[] = [
    { key: 'callsign', label: 'Callsign', visible: true },
    { key: 'firstName', label: 'First Name', visible: true },
    { key: 'lastName', label: 'Last Name', visible: true },
    { key: 'classBoxA', label: 'Class Box A', visible: true },
    { key: 'classBoxB', label: 'Class Box B', visible: true },
    { key: 'wtr', label: 'WTR', visible: true },
    { key: 'classBoxD', label: 'Class Box D', visible: true },
    { key: 'classBoxE', label: 'Class Box E', visible: true },
    { key: 'classBoxF', label: 'Class Box F', visible: true },
    { key: 'classBoxG', label: 'Class Box G', visible: true },
    { key: 'classBoxH', label: 'Class Box H', visible: true },
    { key: 'headerName', label: 'Header Name', visible: true },
    { key: 'footerInfo', label: 'Footer Info', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];
  entries: View2Entry[] = [];
  currentNetId: string = '';
  currentNetName: string = '';
  addRowPlaceholder: any = { isAddRow: true };

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    const savedNetId = localStorage.getItem('currentNetId');
    if (!savedNetId) {
      this.router.navigate(['/ncs-select-net']);
      return;
    }

    this.initializeForm();
    this.dataSource = new MatTableDataSource<any>([this.addRowPlaceholder]);
    this.configureSorting();
    this.configureFilter();

    this.selectNet(savedNetId);
  }

  get displayedColumns(): string[] {
    return this.allColumns.filter(col => col.visible).map(col => col.key);
  }

  configureSorting(): void {
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      return item[property] || '';
    };

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
        data.firstName,
        data.lastName,
        data.headerName,
        data.footerInfo
      ].join(' ').toLowerCase();
      return dataStr.includes(filter);
    };
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

    this.firebaseService.getView2Entries(netId).subscribe({
      next: (entries) => {
        this.entries = entries;
        this.dataSource.data = [this.addRowPlaceholder, ...this.entries];
      },
      error: (error) => {
        console.error('Error loading view2 entries:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.data = [this.addRowPlaceholder, ...this.entries];
    this.cdr.detectChanges();
  }

  initializeForm(): void {
    this.entryForm = this.fb.group({
      callsign: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      classBoxA: [''],
      classBoxB: [''],
      wtr: [''],
      classBoxD: [''],
      classBoxE: [''],
      classBoxF: [''],
      classBoxG: [''],
      classBoxH: [''],
      headerName: [''],
      footerInfo: ['']
    });
  }

  addEntry(): void {
    if (this.entryForm.valid && this.currentNetId) {
      const newEntry: View2Entry = {
        id: '',
        callsign: this.entryForm.value.callsign,
        firstName: this.entryForm.value.firstName || '',
        lastName: this.entryForm.value.lastName || '',
        classBoxA: this.entryForm.value.classBoxA || '',
        classBoxB: this.entryForm.value.classBoxB || '',
        wtr: this.entryForm.value.wtr || '',
        classBoxD: this.entryForm.value.classBoxD || '',
        classBoxE: this.entryForm.value.classBoxE || '',
        classBoxF: this.entryForm.value.classBoxF || '',
        classBoxG: this.entryForm.value.classBoxG || '',
        classBoxH: this.entryForm.value.classBoxH || '',
        headerName: this.entryForm.value.headerName || '',
        footerInfo: this.entryForm.value.footerInfo || '',
        isEditing: false
      };

      this.firebaseService.addView2Entry(this.currentNetId, newEntry).then(() => {
        this.entryForm.reset();
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

  enableEdit(entry: View2Entry): void {
    entry.isEditing = true;
  }

  saveEdit(entry: View2Entry): void {
    entry.isEditing = false;
    if (this.currentNetId && entry.id) {
      this.firebaseService.updateView2Entry(this.currentNetId, entry.id, entry).catch(error => {
        console.error('Error updating entry:', error);
      });
    }
  }

  cancelEdit(entry: View2Entry): void {
    entry.isEditing = false;
  }

  deleteEntry(entry: View2Entry): void {
    if (this.currentNetId && entry.id) {
      this.firebaseService.deleteView2Entry(this.currentNetId, entry.id).catch(error => {
        console.error('Error deleting entry:', error);
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleColumn(column: { key: string; label: string; visible: boolean }): void {
    column.visible = !column.visible;
  }

  isColumnVisible(key: string): boolean {
    const col = this.allColumns.find(c => c.key === key);
    return col ? col.visible : false;
  }
}
