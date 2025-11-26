import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
})
export class FeedbackComponent {
  feedbackType = 'bug';
  subject = '';
  description = '';
  email = '';
  submitting = signal(false);

  feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: 'fas fa-bug' },
    { value: 'feature', label: 'Feature Request', icon: 'fas fa-lightbulb' },
    { value: 'question', label: 'Question', icon: 'fas fa-question-circle' },
    { value: 'other', label: 'Other', icon: 'fas fa-comment' },
  ];

  resources = [
    {
      title: 'Documentation',
      description: 'ATLAS user guide and documentation',
      icon: 'fas fa-book',
      url: 'https://ohdsi.github.io/TheBookOfOhdsi/',
    },
    {
      title: 'GitHub Issues',
      description: 'Report bugs or request features',
      icon: 'fab fa-github',
      url: 'https://github.com/OHDSI/Atlas/issues',
    },
    {
      title: 'OHDSI Forums',
      description: 'Community discussions and support',
      icon: 'fas fa-comments',
      url: 'https://forums.ohdsi.org/',
    },
    {
      title: 'OHDSI Website',
      description: 'Learn more about OHDSI',
      icon: 'fas fa-globe',
      url: 'https://ohdsi.org/',
    },
  ];

  constructor(private snackBar: MatSnackBar) {}

  submitFeedback(): void {
    if (!this.subject || !this.description) {
      this.snackBar.open('Please fill in all required fields', 'OK', {
        duration: 3000,
      });
      return;
    }

    this.submitting.set(true);

    // Simulate submission
    setTimeout(() => {
      this.submitting.set(false);
      this.snackBar.open('Thank you for your feedback!', 'OK', {
        duration: 3000,
      });
      this.resetForm();
    }, 1500);
  }

  resetForm(): void {
    this.feedbackType = 'bug';
    this.subject = '';
    this.description = '';
    this.email = '';
  }

  openResource(url: string): void {
    window.open(url, '_blank');
  }
}
