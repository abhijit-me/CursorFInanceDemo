import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MonthlyReport } from '../../core/models/monthly-report.model';
import { MonthlyReportService } from '../../core/services/monthly-report.service';

interface MonthOption {
  value: number;
  label: string;
}

interface YearOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    NgChartsModule
  ],
  template: `
    <div class="monthly-report-container">
      <div class="header">
        <h1>Monthly Report</h1>
        <div class="date-selector">
          <mat-form-field appearance="outline">
            <mat-label>Month</mat-label>
            <mat-select [(ngModel)]="selectedMonth" (selectionChange)="loadReport()">
              <mat-option *ngFor="let month of months" [value]="month.value">
                {{ month.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Year</mat-label>
            <mat-select [(ngModel)]="selectedYear" (selectionChange)="loadReport()">
              <mat-option *ngFor="let year of years" [value]="year.value">
                {{ year.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>

      <div *ngIf="!loading && report">
        <!-- Spending Breakdown By Category -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Spending Breakdown By Category</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-container">
              <canvas baseChart
                *ngIf="hasChartData"
                [type]="chartType"
                [data]="chartData"
                [options]="chartOptions">
              </canvas>
              <div *ngIf="!hasChartData" class="no-data">
                No spending data available for this month
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Spending Details -->
        <mat-card class="details-card">
          <mat-card-header>
            <mat-card-title>Spending Details</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="report.expenses" class="expenses-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let expense">{{ expense.date | date:'MMM d, y' }}</td>
                  <td mat-footer-cell *matFooterCellDef><strong>TOTAL</strong></td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let expense">{{ expense.description }}</td>
                  <td mat-footer-cell *matFooterCellDef></td>
                </ng-container>

                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let expense">
                    <div class="category-cell">
                      <mat-icon [style.color]="expense.category?.color">
                        {{ expense.category?.icon }}
                      </mat-icon>
                      <span>{{ expense.category?.name }}</span>
                    </div>
                  </td>
                  <td mat-footer-cell *matFooterCellDef></td>
                </ng-container>

                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let expense" class="amount-cell">
                    \${{ expense.amount | number:'1.2-2' }}
                  </td>
                  <td mat-footer-cell *matFooterCellDef class="total-cell">
                    <strong>\${{ report.total_amount | number:'1.2-2' }}</strong>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                <tr mat-footer-row *matFooterRowDef="displayedColumns" class="total-row"></tr>
              </table>

              <div *ngIf="report.expenses.length === 0" class="no-data">
                No expenses recorded for this month
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .monthly-report-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    h1 {
      margin: 0;
    }

    .date-selector {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .date-selector mat-form-field {
      width: 150px;
    }

    .loading-card {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    .chart-card {
      margin-bottom: 30px;
    }

    .chart-container {
      position: relative;
      height: 400px;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .details-card {
      margin-bottom: 30px;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .expenses-table {
      width: 100%;
      min-width: 600px;
    }

    .category-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-cell mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .amount-cell {
      font-weight: 500;
      color: #3f51b5;
    }

    .total-row {
      border-top: 2px solid #3f51b5;
      background-color: #f5f5f5;
    }

    .total-cell {
      font-size: 18px;
      color: #3f51b5;
    }

    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: rgba(0, 0, 0, 0.4);
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .date-selector {
        width: 100%;
        flex-direction: column;
      }

      .date-selector mat-form-field {
        width: 100%;
      }

      .chart-container {
        height: 300px;
        padding: 10px;
      }
    }
  `]
})
export class MonthlyReportComponent implements OnInit {
  loading = true;
  report: MonthlyReport | null = null;
  displayedColumns = ['date', 'description', 'category', 'amount'];

  selectedMonth: number;
  selectedYear: number;

  months: MonthOption[] = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  years: YearOption[] = [];

  // Chart configuration
  chartType: ChartType = 'doughnut';
  chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  constructor(private monthlyReportService: MonthlyReportService) {
    // Initialize with current month and year
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedYear = today.getFullYear();

    // Generate years (current year and 5 years back)
    const currentYear = today.getFullYear();
    for (let i = 0; i < 6; i++) {
      const year = currentYear - i;
      this.years.push({ value: year, label: year.toString() });
    }
  }

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.monthlyReportService.getMonthlyReport(this.selectedYear, this.selectedMonth)
      .subscribe({
        next: (report) => {
          this.report = report;
          this.updateChartData();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading monthly report:', err);
          this.loading = false;
        }
      });
  }

  updateChartData() {
    if (!this.report || this.report.spending_by_category.length === 0) {
      this.chartData = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      };
      return;
    }

    this.chartData = {
      labels: this.report.spending_by_category.map(c => c.category_name),
      datasets: [{
        data: this.report.spending_by_category.map(c => c.amount),
        backgroundColor: this.report.spending_by_category.map(c => c.color)
      }]
    };
  }

  get hasChartData(): boolean {
    return (this.chartData.labels?.length ?? 0) > 0;
  }
}

