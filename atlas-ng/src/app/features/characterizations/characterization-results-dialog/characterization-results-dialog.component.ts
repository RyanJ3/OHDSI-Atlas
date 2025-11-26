import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';

interface CovariateResult {
  name: string;
  category: string;
  targetCount: number;
  targetPercent: number;
  comparatorCount?: number;
  comparatorPercent?: number;
  stdDiff?: number;
}

@Component({
  selector: 'app-characterization-results-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSortModule,
    MatMenuModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <i class="fas fa-user-chart"></i>
      Characterization Results
    </h2>

    <mat-dialog-content>
      <div class="char-info">
        <h3>{{ data.characterization.name }}</h3>
        <p class="description">{{ data.characterization.description }}</p>
        <div class="execution-meta">
          <span class="meta-item">
            <i class="fas fa-database"></i>
            {{ latestExecution?.sourceName || 'Unknown' }}
          </span>
          <span class="meta-item">
            <i class="fas fa-calendar"></i>
            {{ formatDate(latestExecution?.date) }}
          </span>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Summary Stats -->
      <div class="summary-stats">
        <mat-card class="stat-card">
          <div class="stat-value">{{ totalSubjects | number }}</div>
          <div class="stat-label">Total Subjects</div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-value">{{ covariates.length }}</div>
          <div class="stat-label">Covariates Analyzed</div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-value">{{ categories.length }}</div>
          <div class="stat-label">Categories</div>
        </mat-card>
      </div>

      <mat-tab-group>
        <!-- Demographics Tab -->
        <mat-tab label="Demographics">
          <div class="tab-content">
            <table mat-table [dataSource]="getDemographicsCovariates()" class="covariates-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Covariate</th>
                <td mat-cell *matCellDef="let row">{{ row.name }}</td>
              </ng-container>

              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef>Count</th>
                <td mat-cell *matCellDef="let row">{{ row.targetCount | number }}</td>
              </ng-container>

              <ng-container matColumnDef="percent">
                <th mat-header-cell *matHeaderCellDef>Prevalence</th>
                <td mat-cell *matCellDef="let row">
                  <div class="prevalence-cell">
                    <span class="percent-value">{{ row.targetPercent.toFixed(1) }}%</span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="row.targetPercent"
                      color="primary"
                    ></mat-progress-bar>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['name', 'count', 'percent']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'count', 'percent']"></tr>
            </table>
          </div>
        </mat-tab>

        <!-- Conditions Tab -->
        <mat-tab label="Conditions">
          <div class="tab-content">
            <table mat-table [dataSource]="getConditionsCovariates()" class="covariates-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Condition</th>
                <td mat-cell *matCellDef="let row">{{ row.name }}</td>
              </ng-container>

              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef>Count</th>
                <td mat-cell *matCellDef="let row">{{ row.targetCount | number }}</td>
              </ng-container>

              <ng-container matColumnDef="percent">
                <th mat-header-cell *matHeaderCellDef>Prevalence</th>
                <td mat-cell *matCellDef="let row">
                  <div class="prevalence-cell">
                    <span class="percent-value">{{ row.targetPercent.toFixed(1) }}%</span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="row.targetPercent"
                      color="accent"
                    ></mat-progress-bar>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['name', 'count', 'percent']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'count', 'percent']"></tr>
            </table>
          </div>
        </mat-tab>

        <!-- Drugs Tab -->
        <mat-tab label="Drugs">
          <div class="tab-content">
            <table mat-table [dataSource]="getDrugsCovariates()" class="covariates-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Drug</th>
                <td mat-cell *matCellDef="let row">{{ row.name }}</td>
              </ng-container>

              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef>Count</th>
                <td mat-cell *matCellDef="let row">{{ row.targetCount | number }}</td>
              </ng-container>

              <ng-container matColumnDef="percent">
                <th mat-header-cell *matHeaderCellDef>Prevalence</th>
                <td mat-cell *matCellDef="let row">
                  <div class="prevalence-cell">
                    <span class="percent-value">{{ row.targetPercent.toFixed(1) }}%</span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="row.targetPercent"
                      color="warn"
                    ></mat-progress-bar>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['name', 'count', 'percent']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'count', 'percent']"></tr>
            </table>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [matMenuTriggerFor]="exportMenu">
        <i class="fas fa-download"></i>
        Export
        <i class="fas fa-caret-down" style="margin-left: 4px;"></i>
      </button>
      <mat-menu #exportMenu="matMenu">
        <button mat-menu-item (click)="exportResults()">
          <i class="fas fa-file-csv"></i>
          Export as CSV
        </button>
        <button mat-menu-item (click)="exportJSON()">
          <i class="fas fa-file-code"></i>
          Export as JSON
        </button>
      </mat-menu>
      <button mat-raised-button color="primary" mat-dialog-close>
        Close
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      i { color: #00897b; }
    }

    mat-dialog-content {
      min-width: 700px;
      max-height: 70vh;
    }

    .char-info {
      padding: 16px 0;
      h3 { margin: 0 0 8px 0; color: #333; }
      .description { color: #666; font-size: 14px; margin: 0 0 12px 0; }
      .execution-meta {
        display: flex;
        gap: 20px;
        .meta-item {
          font-size: 13px;
          color: #666;
          i { margin-right: 6px; color: #888; }
        }
      }
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 16px 0;
    }

    .stat-card {
      padding: 16px;
      text-align: center;
      .stat-value { font-size: 28px; font-weight: 600; color: #00897b; }
      .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
    }

    .tab-content { padding: 16px 0; }

    .covariates-table {
      width: 100%;
      th { background: #fafafa; font-weight: 600; }
      td { padding: 12px 16px; }
    }

    .prevalence-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      .percent-value { min-width: 50px; font-weight: 500; }
      mat-progress-bar { flex: 1; max-width: 200px; height: 8px; border-radius: 4px; }
    }

    mat-dialog-actions button i { margin-right: 6px; }
  `],
})
export class CharacterizationResultsDialogComponent {
  covariates: CovariateResult[] = [];
  categories: string[] = ['Demographics', 'Conditions', 'Drugs'];
  totalSubjects = 0;
  latestExecution: any;

  constructor(
    public dialogRef: MatDialogRef<CharacterizationResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { characterization: any }
  ) {
    this.latestExecution = data.characterization.latestExecution;
    this.generateMockResults();
  }

  private generateMockResults(): void {
    this.totalSubjects = Math.floor(Math.random() * 50000) + 10000;

    const demographics = [
      'Age 18-34', 'Age 35-54', 'Age 55-64', 'Age 65+',
      'Male', 'Female', 'Race: White', 'Race: Black', 'Race: Asian', 'Race: Other'
    ];

    const conditions = [
      'Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'Obesity',
      'Coronary artery disease', 'Heart failure', 'Atrial fibrillation',
      'COPD', 'Chronic kidney disease', 'Depression'
    ];

    const drugs = [
      'ACE inhibitors', 'Beta blockers', 'Statins', 'Metformin',
      'Aspirin', 'Proton pump inhibitors', 'Diuretics',
      'Calcium channel blockers', 'ARBs', 'Anticoagulants'
    ];

    this.covariates = [
      ...demographics.map(name => this.createCovariate(name, 'Demographics')),
      ...conditions.map(name => this.createCovariate(name, 'Conditions')),
      ...drugs.map(name => this.createCovariate(name, 'Drugs')),
    ];
  }

  private createCovariate(name: string, category: string): CovariateResult {
    const percent = Math.random() * 60 + 5;
    return {
      name,
      category,
      targetCount: Math.floor(this.totalSubjects * percent / 100),
      targetPercent: percent,
    };
  }

  getDemographicsCovariates(): CovariateResult[] {
    return this.covariates.filter(c => c.category === 'Demographics')
      .sort((a, b) => b.targetPercent - a.targetPercent);
  }

  getConditionsCovariates(): CovariateResult[] {
    return this.covariates.filter(c => c.category === 'Conditions')
      .sort((a, b) => b.targetPercent - a.targetPercent);
  }

  getDrugsCovariates(): CovariateResult[] {
    return this.covariates.filter(c => c.category === 'Drugs')
      .sort((a, b) => b.targetPercent - a.targetPercent);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  }

  exportResults(): void {
    // Build CSV content
    const headers = ['Category', 'Covariate', 'Count', 'Prevalence (%)'];
    const rows = this.covariates.map(c => [
      c.category,
      c.name,
      c.targetCount.toString(),
      c.targetPercent.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `characterization_${this.data.characterization.id}_results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportJSON(): void {
    const exportData = {
      characterization: {
        id: this.data.characterization.id,
        name: this.data.characterization.name,
        description: this.data.characterization.description,
      },
      execution: this.latestExecution,
      summary: {
        totalSubjects: this.totalSubjects,
        covariateCount: this.covariates.length,
        categories: this.categories,
      },
      results: {
        demographics: this.getDemographicsCovariates(),
        conditions: this.getConditionsCovariates(),
        drugs: this.getDrugsCovariates(),
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `characterization_${this.data.characterization.id}_results.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
