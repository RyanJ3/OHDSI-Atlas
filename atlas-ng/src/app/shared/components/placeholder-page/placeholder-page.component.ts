import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { setPageTitle } from '../../../core/store';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="placeholder-page">
      <mat-card class="placeholder-page__card">
        <mat-card-content>
          <div class="placeholder-page__icon">
            <i class="fas {{ icon }}"></i>
          </div>
          <h1 class="placeholder-page__title">{{ title }}</h1>
          <p class="placeholder-page__description">
            This page is under construction as part of the Angular migration.
          </p>
          <div class="placeholder-page__status">
            <span class="placeholder-page__badge">Coming Soon</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .placeholder-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;

      &__card {
        max-width: 500px;
        text-align: center;
        border-radius: 12px !important;
      }

      &__icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;

        i {
          font-size: 32px;
          color: white;
        }
      }

      &__title {
        font-size: 1.5rem;
        font-weight: 500;
        margin-bottom: 16px;
        color: #333;
      }

      &__description {
        color: #666;
        margin-bottom: 24px;
      }

      &__badge {
        display: inline-block;
        background-color: #ff9800;
        color: white;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
      }
    }
  `],
})
export class PlaceholderPageComponent implements OnInit {
  title = 'Page';
  icon = 'fa-cog';

  private store = inject(Store);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const data = this.route.snapshot.data;
    this.title = data['title'] || 'Page';
    this.icon = data['icon'] || 'fa-cog';
    this.store.dispatch(setPageTitle({ title: this.title }));
  }
}
