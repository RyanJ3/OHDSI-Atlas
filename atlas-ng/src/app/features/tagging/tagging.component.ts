import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

interface Tag {
  id: number;
  name: string;
  color: string;
  usageCount: number;
  createdBy: string;
}

@Component({
  selector: 'app-tagging',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './tagging.component.html',
  styleUrl: './tagging.component.scss',
})
export class TaggingComponent implements OnInit {
  loading = signal(true);
  tags = signal<Tag[]>([]);
  newTagName = '';
  searchFilter = '';

  mockTags: Tag[] = [
    { id: 1, name: 'cardiovascular', color: '#e91e63', usageCount: 24, createdBy: 'admin' },
    { id: 2, name: 'diabetes', color: '#9c27b0', usageCount: 18, createdBy: 'demo' },
    { id: 3, name: 'oncology', color: '#673ab7', usageCount: 12, createdBy: 'admin' },
    { id: 4, name: 'respiratory', color: '#3f51b5', usageCount: 8, createdBy: 'researcher1' },
    { id: 5, name: 'safety', color: '#f44336', usageCount: 31, createdBy: 'admin' },
    { id: 6, name: 'effectiveness', color: '#4caf50', usageCount: 27, createdBy: 'demo' },
    { id: 7, name: 'real-world-evidence', color: '#00bcd4', usageCount: 15, createdBy: 'admin' },
    { id: 8, name: 'validated', color: '#8bc34a', usageCount: 22, createdBy: 'researcher1' },
    { id: 9, name: 'draft', color: '#ff9800', usageCount: 9, createdBy: 'demo' },
    { id: 10, name: 'archived', color: '#9e9e9e', usageCount: 5, createdBy: 'admin' },
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.tags.set(this.mockTags);
      this.loading.set(false);
    }, 300);
  }

  get filteredTags(): Tag[] {
    const search = this.searchFilter.toLowerCase();
    if (!search) return this.tags();
    return this.tags().filter((t) => t.name.toLowerCase().includes(search));
  }

  addTag(): void {
    if (!this.newTagName.trim()) return;

    const colors = ['#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50', '#ff9800'];
    const newTag: Tag = {
      id: this.tags().length + 1,
      name: this.newTagName.toLowerCase().replace(/\s+/g, '-'),
      color: colors[Math.floor(Math.random() * colors.length)],
      usageCount: 0,
      createdBy: 'demo',
    };

    this.tags.set([...this.tags(), newTag]);
    this.newTagName = '';
    this.snackBar.open(`Tag "${newTag.name}" created`, '', { duration: 2000 });
  }

  deleteTag(tag: Tag): void {
    if (confirm(`Delete tag "${tag.name}"? This will remove it from all items.`)) {
      this.tags.set(this.tags().filter((t) => t.id !== tag.id));
      this.snackBar.open(`Tag "${tag.name}" deleted`, '', { duration: 2000 });
    }
  }

  editTag(tag: Tag): void {
    this.snackBar.open(`Editing "${tag.name}"...`, '', { duration: 2000 });
  }

  getTotalUsage(): number {
    return this.tags().reduce((sum, t) => sum + t.usageCount, 0);
  }
}
