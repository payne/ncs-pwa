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
import { FirebaseService } from '../_services/firebase.service';
import { Operator } from '../_models/operator.model';

interface EditablePerson extends Operator {
  isNew?: boolean;
}

@Component({
  selector: 'app-ncs-people',
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
    MatMenuModule
  ],
  templateUrl: './ncs-people.html',
  styleUrl: './ncs-people.css',
})
export class NcsPeople implements OnInit {
  displayedColumns: string[] = ['callsign', 'name', 'clubs', 'actions'];
  dataSource!: MatTableDataSource<EditablePerson>;
  people: EditablePerson[] = [];
  addRowPlaceholder: EditablePerson = { isNew: true, callsign: '', name: '', clubs: [] };

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<EditablePerson>([this.addRowPlaceholder]);
    this.loadPeople();
  }

  ngAfterViewInit(): void {
    this.configureSorting();
  }

  loadPeople(): void {
    this.firebaseService.getPeople().subscribe({
      next: (people) => {
        this.people = people;
        this.dataSource.data = [this.addRowPlaceholder, ...this.people];
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
      },
      error: (error) => {
        console.error('Error loading people:', error);
      }
    });
  }

  configureSorting(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }

    this.dataSource.sortingDataAccessor = (item: EditablePerson, property: string) => {
      if (property === 'clubs') {
        return item.clubs?.join(', ') || '';
      }
      return (item as any)[property] || '';
    };

    const defaultSort = this.dataSource.sortData;
    this.dataSource.sortData = (data: EditablePerson[], sort: MatSort) => {
      const addRow = data.find(item => item.isNew);
      const otherRows = data.filter(item => !item.isNew);
      const sortedRows = defaultSort.call(this.dataSource, otherRows, sort);
      return addRow ? [addRow, ...sortedRows] : sortedRows;
    };
  }

  onCellBlur(person: EditablePerson, field: string, value: string): void {
    if (person.isNew) return;

    const currentValue = (person as any)[field];
    if (currentValue !== value) {
      (person as any)[field] = value;
      this.savePerson(person);
    }
  }

  onClubsBlur(person: EditablePerson, value: string): void {
    if (person.isNew) return;

    const newClubs = value.split(',').map(c => c.trim()).filter(c => c);
    const currentClubs = person.clubs || [];

    if (JSON.stringify(currentClubs) !== JSON.stringify(newClubs)) {
      person.clubs = newClubs;
      this.savePerson(person);
    }
  }

  savePerson(person: EditablePerson): void {
    if (person.id) {
      this.firebaseService.updatePerson(person.id, {
        callsign: person.callsign,
        name: person.name,
        clubs: person.clubs
      }).catch(error => {
        console.error('Error saving person:', error);
      });
    }
  }

  addPerson(): void {
    const callsign = this.addRowPlaceholder.callsign?.trim();
    const name = this.addRowPlaceholder.name?.trim();

    if (!callsign && !name) return;

    const newPerson: Operator = {
      callsign: callsign || '',
      name: name || '',
      clubs: this.addRowPlaceholder.clubs || []
    };

    this.firebaseService.addPerson(newPerson).then(() => {
      this.addRowPlaceholder = { isNew: true, callsign: '', name: '', clubs: [] };
    }).catch(error => {
      console.error('Error adding person:', error);
    });
  }

  deletePerson(person: EditablePerson): void {
    if (person.id) {
      this.firebaseService.deletePerson(person.id).catch(error => {
        console.error('Error deleting person:', error);
      });
    }
  }

  getClubsString(clubs: string[]): string {
    return clubs?.join(', ') || '';
  }

  onAddRowClubsBlur(value: string): void {
    this.addRowPlaceholder.clubs = value.split(',').map(c => c.trim()).filter(c => c);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
