import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfigService } from '../../core/config';
import { catchError, of } from 'rxjs';
import { CreateConceptSetDialogComponent } from './create-concept-set-dialog/create-concept-set-dialog.component';
import { EditConceptSetDialogComponent } from './edit-concept-set-dialog/edit-concept-set-dialog.component';

// Import mock data for fallback
import conceptSetsData from '../../core/mock-data/concept-sets.json';

interface ConceptSet {
  id: number;
  name: string;
  description?: string;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  conceptCount?: number;
}

@Component({
  selector: 'app-concept-sets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatSortModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './concept-sets.component.html',
  styleUrl: './concept-sets.component.scss',
})
export class ConceptSetsComponent implements OnInit {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = signal(true);
  conceptSets = signal<ConceptSet[]>([]);
  filteredConceptSets = signal<ConceptSet[]>([]);
  totalResults = signal(0);
  error = signal<string | null>(null);

  searchFilter = '';
  pageSize = 25;
  pageIndex = 0;

  displayedColumns = ['id', 'name', 'modifiedBy', 'modifiedDate', 'actions'];

  ngOnInit(): void {
    this.loadConceptSets();
  }

  loadConceptSets(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<ConceptSet[]>(`${this.config.webApiUrl}conceptset/`)
      .pipe(
        catchError((err) => {
          console.error('Failed to load concept sets from API, using mock data:', err);
          // Return mock data as fallback
          return of(conceptSetsData as ConceptSet[]);
        })
      )
      .subscribe((conceptSets) => {
        this.conceptSets.set(conceptSets);
        this.filteredConceptSets.set(conceptSets);
        this.totalResults.set(conceptSets.length);
        this.loading.set(false);
      });
  }

  applyFilter(): void {
    const filter = this.searchFilter.toLowerCase().trim();
    if (!filter) {
      this.filteredConceptSets.set(this.conceptSets());
    } else {
      this.filteredConceptSets.set(
        this.conceptSets().filter(
          (cs) =>
            cs.name.toLowerCase().includes(filter) ||
            cs.description?.toLowerCase().includes(filter) ||
            cs.createdBy?.toLowerCase().includes(filter) ||
            cs.modifiedBy?.toLowerCase().includes(filter)
        )
      );
    }
    this.totalResults.set(this.filteredConceptSets().length);
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSort(sort: Sort): void {
    const data = [...this.filteredConceptSets()];
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredConceptSets.set(
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'id':
            return this.compare(a.id, b.id, isAsc);
          case 'name':
            return this.compare(a.name, b.name, isAsc);
          case 'modifiedBy':
            return this.compare(a.modifiedBy || '', b.modifiedBy || '', isAsc);
          case 'modifiedDate':
            return this.compare(a.modifiedDate || '', b.modifiedDate || '', isAsc);
          default:
            return 0;
        }
      })
    );
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getPaginatedConceptSets(): ConceptSet[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredConceptSets().slice(start, end);
  }

  createNew(): void {
    const dialogRef = this.dialog.open(CreateConceptSetDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.conceptSets.update(current => [result, ...current]);
        this.applyFilter();
        this.snackBar.open(`Created concept set "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  editConceptSet(conceptSet: ConceptSet): void {
    const dialogRef = this.dialog.open(EditConceptSetDialogComponent, {
      width: '750px',
      data: { conceptSet },
    });

    dialogRef.afterClosed().subscribe((result: ConceptSet | undefined) => {
      if (result) {
        this.conceptSets.update(current =>
          current.map(cs => cs.id === result.id ? result : cs)
        );
        this.applyFilter();
        this.snackBar.open(`Updated "${result.name}"`, 'OK', { duration: 3000 });
      }
    });
  }

  copyConceptSet(conceptSet: ConceptSet): void {
    const copiedSet: ConceptSet = {
      ...conceptSet,
      id: Math.floor(Math.random() * 10000) + 1000,
      name: `${conceptSet.name} (Copy)`,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      createdBy: 'demo',
      modifiedBy: 'demo',
    };
    this.conceptSets.update(current => [copiedSet, ...current]);
    this.applyFilter();
    this.snackBar.open(`Created copy of "${conceptSet.name}"`, 'Edit', { duration: 3000 })
      .onAction().subscribe(() => {
        this.editConceptSet(copiedSet);
      });
  }

  deleteConceptSet(conceptSet: ConceptSet): void {
    // Remove from list
    this.conceptSets.update(current => current.filter(cs => cs.id !== conceptSet.id));
    this.applyFilter();

    // Show undo option
    const snackBarRef = this.snackBar.open(`Deleted "${conceptSet.name}"`, 'Undo', { duration: 5000 });
    snackBarRef.onAction().subscribe(() => {
      // Restore if undo clicked
      this.conceptSets.update(current => [conceptSet, ...current]);
      this.applyFilter();
    });
  }

  exportConceptSet(conceptSet: ConceptSet): void {
    window.open(
      `${this.config.webApiUrl}conceptset/${conceptSet.id}/export`,
      '_blank'
    );
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }
}
