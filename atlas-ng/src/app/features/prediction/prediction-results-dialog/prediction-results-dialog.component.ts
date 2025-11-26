import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';

interface FeatureImportance {
  name: string;
  coefficient: number;
  importance: number;
}

interface ConfusionMatrix {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

interface PredictionResult {
  sourceName: string;
  executionDate: string;
  targetCohortCount: number;
  outcomeCohortCount: number;
  auc: number;
  aucLower: number;
  aucUpper: number;
  calibrationSlope: number;
  calibrationIntercept: number;
  brierScore: number;
  sensitivity: number;
  specificity: number;
  ppv: number;
  npv: number;
  confusionMatrix: ConfusionMatrix;
  topFeatures: FeatureImportance[];
}

@Component({
  selector: 'app-prediction-results-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressBarModule,
    MatMenuModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <i class="fas fa-brain"></i>
      Prediction Model Results
    </h2>

    <mat-dialog-content>
      <!-- Model Info -->
      <div class="model-info">
        <h3>{{ data.prediction.name }}</h3>
        <p class="description">{{ data.prediction.description }}</p>
        <div class="model-meta">
          <mat-chip>{{ data.prediction.modelType }}</mat-chip>
          <mat-chip class="tar-chip">
            <i class="fas fa-clock"></i>
            {{ data.prediction.timeAtRisk }}
          </mat-chip>
        </div>
      </div>

      <mat-divider></mat-divider>

      <mat-tab-group>
        <!-- Performance Tab -->
        <mat-tab label="Performance">
          <div class="tab-content">
            <!-- Key Metrics -->
            <div class="metrics-grid">
              <mat-card class="metric-card auc">
                <div class="metric-label">AUC-ROC</div>
                <div class="metric-value" [ngClass]="getAucClass(result.auc)">
                  {{ result.auc.toFixed(3) }}
                </div>
                <div class="metric-ci">
                  95% CI: {{ result.aucLower.toFixed(3) }} - {{ result.aucUpper.toFixed(3) }}
                </div>
              </mat-card>

              <mat-card class="metric-card">
                <div class="metric-label">Calibration Slope</div>
                <div class="metric-value">{{ result.calibrationSlope.toFixed(3) }}</div>
                <div class="metric-ideal">Ideal: 1.0</div>
              </mat-card>

              <mat-card class="metric-card">
                <div class="metric-label">Brier Score</div>
                <div class="metric-value">{{ result.brierScore.toFixed(4) }}</div>
                <div class="metric-ideal">Lower is better</div>
              </mat-card>

              <mat-card class="metric-card">
                <div class="metric-label">Sensitivity</div>
                <div class="metric-value">{{ (result.sensitivity * 100).toFixed(1) }}%</div>
              </mat-card>

              <mat-card class="metric-card">
                <div class="metric-label">Specificity</div>
                <div class="metric-value">{{ (result.specificity * 100).toFixed(1) }}%</div>
              </mat-card>

              <mat-card class="metric-card">
                <div class="metric-label">PPV</div>
                <div class="metric-value">{{ (result.ppv * 100).toFixed(1) }}%</div>
              </mat-card>
            </div>

            <!-- ROC Curve Placeholder -->
            <div class="chart-section">
              <h4>ROC Curve</h4>
              <div class="chart-placeholder">
                <div class="roc-visualization">
                  <div class="roc-axes">
                    <div class="y-axis-label">Sensitivity</div>
                    <div class="x-axis-label">1 - Specificity</div>
                  </div>
                  <svg viewBox="0 0 100 100" class="roc-chart">
                    <line x1="0" y1="100" x2="100" y2="0" class="diagonal" />
                    <path [attr.d]="rocPath" class="roc-curve" />
                    <circle [attr.cx]="(1 - result.specificity) * 100"
                            [attr.cy]="(1 - result.sensitivity) * 100"
                            r="3"
                            class="operating-point" />
                  </svg>
                  <div class="auc-annotation">AUC = {{ result.auc.toFixed(3) }}</div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Confusion Matrix Tab -->
        <mat-tab label="Confusion Matrix">
          <div class="tab-content">
            <div class="confusion-matrix">
              <div class="matrix-header"></div>
              <div class="matrix-header predicted">Predicted Positive</div>
              <div class="matrix-header predicted">Predicted Negative</div>

              <div class="matrix-header actual">Actual Positive</div>
              <div class="matrix-cell tp">
                <span class="cell-value">{{ result.confusionMatrix.truePositive | number }}</span>
                <span class="cell-label">True Positive</span>
              </div>
              <div class="matrix-cell fn">
                <span class="cell-value">{{ result.confusionMatrix.falseNegative | number }}</span>
                <span class="cell-label">False Negative</span>
              </div>

              <div class="matrix-header actual">Actual Negative</div>
              <div class="matrix-cell fp">
                <span class="cell-value">{{ result.confusionMatrix.falsePositive | number }}</span>
                <span class="cell-label">False Positive</span>
              </div>
              <div class="matrix-cell tn">
                <span class="cell-value">{{ result.confusionMatrix.trueNegative | number }}</span>
                <span class="cell-label">True Negative</span>
              </div>
            </div>

            <div class="matrix-stats">
              <div class="stat">
                <span class="stat-label">Total Subjects:</span>
                <span class="stat-value">{{ getTotalSubjects() | number }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Outcome Rate:</span>
                <span class="stat-value">{{ (getOutcomeRate() * 100).toFixed(2) }}%</span>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Features Tab -->
        <mat-tab label="Top Features">
          <div class="tab-content">
            <p class="features-intro">Top predictive features in the model:</p>
            <div class="features-list">
              @for (feature of result.topFeatures; track feature.name; let i = $index) {
                <div class="feature-item">
                  <span class="feature-rank">{{ i + 1 }}</span>
                  <div class="feature-info">
                    <span class="feature-name">{{ feature.name }}</span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="feature.importance * 100"
                      [color]="feature.coefficient > 0 ? 'primary' : 'warn'"
                    ></mat-progress-bar>
                  </div>
                  <span class="feature-coef" [ngClass]="feature.coefficient > 0 ? 'positive' : 'negative'">
                    {{ feature.coefficient > 0 ? '+' : '' }}{{ feature.coefficient.toFixed(3) }}
                  </span>
                </div>
              }
            </div>
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

      i { color: #c2185b; }
    }

    mat-dialog-content {
      min-width: 750px;
      max-height: 70vh;
    }

    .model-info {
      padding: 16px 0;

      h3 { margin: 0 0 8px 0; color: #333; }
      .description { color: #666; font-size: 14px; margin: 0 0 12px 0; }

      .model-meta {
        display: flex;
        gap: 8px;

        .tar-chip i { margin-right: 6px; }
      }
    }

    .tab-content { padding: 20px 0; }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .metric-card {
      padding: 16px;
      text-align: center;

      .metric-label {
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
        margin-bottom: 8px;
      }

      .metric-value {
        font-size: 28px;
        font-weight: 600;
        color: #333;

        &.excellent { color: #2e7d32; }
        &.good { color: #1976d2; }
        &.fair { color: #f57c00; }
        &.poor { color: #c62828; }
      }

      .metric-ci, .metric-ideal {
        font-size: 11px;
        color: #888;
        margin-top: 4px;
      }
    }

    .chart-section {
      margin-top: 24px;

      h4 { margin: 0 0 12px 0; color: #333; }
    }

    .chart-placeholder {
      background: #fafafa;
      border-radius: 8px;
      padding: 20px;
    }

    .roc-visualization {
      position: relative;
      width: 300px;
      height: 300px;
      margin: 0 auto;

      .roc-axes {
        position: absolute;
        width: 100%;
        height: 100%;

        .y-axis-label {
          position: absolute;
          left: -40px;
          top: 50%;
          transform: rotate(-90deg) translateX(50%);
          font-size: 12px;
          color: #666;
        }

        .x-axis-label {
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #666;
        }
      }

      .roc-chart {
        width: 100%;
        height: 100%;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;

        .diagonal {
          stroke: #ccc;
          stroke-dasharray: 4;
        }

        .roc-curve {
          fill: none;
          stroke: #c2185b;
          stroke-width: 2;
        }

        .operating-point {
          fill: #c2185b;
        }
      }

      .auc-annotation {
        position: absolute;
        bottom: 40px;
        right: 40px;
        background: rgba(255,255,255,0.9);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
        color: #c2185b;
      }
    }

    .confusion-matrix {
      display: grid;
      grid-template-columns: 120px 1fr 1fr;
      gap: 4px;
      max-width: 500px;
      margin: 0 auto;
    }

    .matrix-header {
      padding: 12px;
      font-weight: 600;
      font-size: 12px;
      text-align: center;
      color: #666;

      &.predicted { background: #e3f2fd; }
      &.actual { background: #fce4ec; writing-mode: vertical-rl; text-orientation: mixed; }
    }

    .matrix-cell {
      padding: 20px;
      text-align: center;
      border-radius: 4px;

      .cell-value { display: block; font-size: 24px; font-weight: 600; }
      .cell-label { display: block; font-size: 10px; color: #666; margin-top: 4px; }

      &.tp { background: #c8e6c9; color: #2e7d32; }
      &.tn { background: #c8e6c9; color: #2e7d32; }
      &.fp { background: #ffcdd2; color: #c62828; }
      &.fn { background: #ffcdd2; color: #c62828; }
    }

    .matrix-stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 20px;

      .stat {
        .stat-label { color: #666; font-size: 13px; }
        .stat-value { font-weight: 600; margin-left: 8px; }
      }
    }

    .features-intro {
      color: #666;
      margin: 0 0 16px 0;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;

      .feature-rank {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 12px;
        color: #666;
      }

      .feature-info {
        flex: 1;

        .feature-name {
          display: block;
          font-size: 13px;
          margin-bottom: 6px;
        }

        mat-progress-bar { height: 6px; border-radius: 3px; }
      }

      .feature-coef {
        font-family: monospace;
        font-size: 13px;
        font-weight: 600;

        &.positive { color: #2e7d32; }
        &.negative { color: #c62828; }
      }
    }

    mat-dialog-actions button i { margin-right: 6px; }
  `],
})
export class PredictionResultsDialogComponent {
  result: PredictionResult;
  rocPath: string;

  constructor(
    public dialogRef: MatDialogRef<PredictionResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { prediction: any }
  ) {
    this.result = this.generateMockResults();
    this.rocPath = this.generateRocPath();
  }

  private generateMockResults(): PredictionResult {
    const auc = this.data.prediction.latestExecution?.auc || 0.75;
    const calibration = this.data.prediction.latestExecution?.calibration || 0.9;

    const totalSubjects = Math.floor(Math.random() * 30000) + 10000;
    const outcomeRate = Math.random() * 0.15 + 0.05;
    const outcomes = Math.floor(totalSubjects * outcomeRate);

    const sensitivity = Math.random() * 0.3 + 0.6;
    const specificity = Math.random() * 0.2 + 0.7;

    const tp = Math.floor(outcomes * sensitivity);
    const fn = outcomes - tp;
    const fp = Math.floor((totalSubjects - outcomes) * (1 - specificity));
    const tn = totalSubjects - outcomes - fp;

    return {
      sourceName: this.data.prediction.latestExecution?.sourceName || 'Unknown',
      executionDate: this.data.prediction.latestExecution?.date
        ? new Date(this.data.prediction.latestExecution.date).toLocaleDateString()
        : 'N/A',
      targetCohortCount: totalSubjects,
      outcomeCohortCount: outcomes,
      auc,
      aucLower: Math.max(0.5, auc - 0.05),
      aucUpper: Math.min(1, auc + 0.05),
      calibrationSlope: calibration,
      calibrationIntercept: (Math.random() - 0.5) * 0.2,
      brierScore: Math.random() * 0.1 + 0.05,
      sensitivity,
      specificity,
      ppv: tp / (tp + fp),
      npv: tn / (tn + fn),
      confusionMatrix: { truePositive: tp, falsePositive: fp, trueNegative: tn, falseNegative: fn },
      topFeatures: this.generateFeatures(),
    };
  }

  private generateFeatures(): FeatureImportance[] {
    const features = [
      'Age at index', 'Prior hospitalization', 'Charlson comorbidity index',
      'Diabetes diagnosis', 'Hypertension', 'Prior medication count',
      'BMI > 30', 'Smoking history', 'Heart failure history', 'eGFR < 60'
    ];

    return features.slice(0, 8).map(name => ({
      name,
      coefficient: (Math.random() - 0.3) * 2,
      importance: Math.random() * 0.8 + 0.2,
    })).sort((a, b) => b.importance - a.importance);
  }

  private generateRocPath(): string {
    const auc = this.result.auc;
    const points: string[] = ['M 0 100'];

    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * 100;
      const y = 100 - Math.pow(i / 10, 1 / (auc * 2)) * 100;
      points.push(`L ${x} ${Math.max(0, y)}`);
    }

    return points.join(' ');
  }

  getAucClass(auc: number): string {
    if (auc >= 0.8) return 'excellent';
    if (auc >= 0.7) return 'good';
    if (auc >= 0.6) return 'fair';
    return 'poor';
  }

  getTotalSubjects(): number {
    const cm = this.result.confusionMatrix;
    return cm.truePositive + cm.falsePositive + cm.trueNegative + cm.falseNegative;
  }

  getOutcomeRate(): number {
    const cm = this.result.confusionMatrix;
    return (cm.truePositive + cm.falseNegative) / this.getTotalSubjects();
  }

  exportResults(): void {
    // Build CSV content for performance metrics and features
    const metricsHeaders = ['Metric', 'Value'];
    const metricsRows = [
      ['AUC-ROC', this.result.auc.toFixed(3)],
      ['AUC Lower CI', this.result.aucLower.toFixed(3)],
      ['AUC Upper CI', this.result.aucUpper.toFixed(3)],
      ['Calibration Slope', this.result.calibrationSlope.toFixed(3)],
      ['Calibration Intercept', this.result.calibrationIntercept.toFixed(3)],
      ['Brier Score', this.result.brierScore.toFixed(4)],
      ['Sensitivity', (this.result.sensitivity * 100).toFixed(1) + '%'],
      ['Specificity', (this.result.specificity * 100).toFixed(1) + '%'],
      ['PPV', (this.result.ppv * 100).toFixed(1) + '%'],
      ['NPV', (this.result.npv * 100).toFixed(1) + '%'],
    ];

    const featureHeaders = ['Feature', 'Coefficient', 'Importance'];
    const featureRows = this.result.topFeatures.map(f => [
      f.name,
      f.coefficient.toFixed(3),
      f.importance.toFixed(3),
    ]);

    const csvContent = [
      '# Performance Metrics',
      metricsHeaders.join(','),
      ...metricsRows.map(row => row.join(',')),
      '',
      '# Top Features',
      featureHeaders.join(','),
      ...featureRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prediction_${this.data.prediction.id}_results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportJSON(): void {
    const exportData = {
      prediction: {
        id: this.data.prediction.id,
        name: this.data.prediction.name,
        description: this.data.prediction.description,
        modelType: this.data.prediction.modelType,
        timeAtRisk: this.data.prediction.timeAtRisk,
      },
      performance: {
        auc: this.result.auc,
        aucCI: [this.result.aucLower, this.result.aucUpper],
        calibrationSlope: this.result.calibrationSlope,
        calibrationIntercept: this.result.calibrationIntercept,
        brierScore: this.result.brierScore,
        sensitivity: this.result.sensitivity,
        specificity: this.result.specificity,
        ppv: this.result.ppv,
        npv: this.result.npv,
      },
      confusionMatrix: this.result.confusionMatrix,
      topFeatures: this.result.topFeatures,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prediction_${this.data.prediction.id}_results.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
