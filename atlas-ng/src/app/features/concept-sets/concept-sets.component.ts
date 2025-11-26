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
import { ConfigService } from '../../core/config';
import { catchError, of } from 'rxjs';

interface ConceptSet {
  id: number;
  name: string;
  description?: string;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
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
  ],
  templateUrl: './concept-sets.component.html',
  styleUrl: './concept-sets.component.scss',
})
export class ConceptSetsComponent implements OnInit {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private snackBar = inject(MatSnackBar);

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
          console.error('Failed to load concept sets:', err);
          this.error.set('Failed to load concept sets. Please check your connection.');
          return of([]);
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
    this.snackBar.open('Create new concept set (not implemented)', 'OK', {
      duration: 2000,
    });
  }

  editConceptSet(conceptSet: ConceptSet): void {
    window.open(`#/conceptset/${conceptSet.id}/details`, '_blank');
  }

  copyConceptSet(conceptSet: ConceptSet): void {
    this.snackBar.open(`Copying "${conceptSet.name}"...`, '', { duration: 2000 });
    // Would call API to copy
  }

  deleteConceptSet(conceptSet: ConceptSet): void {
    if (confirm(`Are you sure you want to delete "${conceptSet.name}"?`)) {
      this.http
        .delete(`${this.config.webApiUrl}conceptset/${conceptSet.id}`)
        .pipe(
          catchError((err) => {
            console.error('Delete failed:', err);
            this.snackBar.open('Failed to delete concept set', 'OK', {
              duration: 3000,
            });
            return of(null);
          })
        )
        .subscribe((result) => {
          if (result !== null) {
            this.snackBar.open(`Deleted "${conceptSet.name}"`, 'OK', {
              duration: 2000,
            });
            this.loadConceptSets();
          }
        });
    }
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
