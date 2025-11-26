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
  templateUrl: './prediction-results-dialog.component.html',
  styleUrl: './prediction-results-dialog.component.scss',
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
