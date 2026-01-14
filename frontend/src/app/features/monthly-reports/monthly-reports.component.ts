import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { MonthlyReportService } from '../../core/services/monthly-report.service';
import { MonthlyReport, ExpenseDetail } from '../../core/models/monthly-report.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-monthly-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    NgChartsModule
  ],
  template: `
    <div class="monthly-report-container">
      <div class="header">
        <h1>Monthly Report</h1>
        <div class="month-selector">
          <mat-form-field appearance="outline">
            <mat-label>Month</mat-label>
            <mat-select [(value)]="selectedMonth" (selectionChange)="onMonthChange()">
              <mat-option *ngFor="let m of months" [value]="m.value">
                {{ m.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Year</mat-label>
            <mat-select [(value)]="selectedYear" (selectionChange)="onYearChange()">
              <mat-option *ngFor="let y of years" [value]="y">
                {{ y }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>

      <div *ngIf="!loading && report">
        <!-- Spending Breakdown Pie Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Spending Breakup By Category</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-container">
              <canvas baseChart
                *ngIf="hasChartData"
                [type]="pieChartType"
                [data]="pieChartData"
                [options]="pieChartOptions">
              </canvas>
              <div *ngIf="!hasChartData" class="no-data">
                No spending data available for this month
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Top 3 Spending Categories -->
        <mat-card class="top-categories-card" *ngIf="report.topCategories.length > 0">
          <mat-card-header>
            <mat-card-title>Top 3 Spending Categories</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="category-list">
              <div *ngFor="let category of report.topCategories" class="category-item">
                <div class="category-header">
                  <div class="category-info">
                    <mat-icon [style.color]="category.color">{{ category.icon }}</mat-icon>
                    <span class="category-name">{{ category.categoryName }}</span>
                  </div>
                </div>
                <div class="progress-section">
                  <div class="progress-label">
                    <span class="label">Budget</span>
                    <span class="amount">\${{ category.budget | number:'1.0-0' }}</span>
                  </div>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="100"
                    class="budget-bar">
                  </mat-progress-bar>
                </div>
                <div class="progress-section">
                  <div class="progress-label">
                    <span class="label">Spending</span>
                    <span class="amount">\${{ category.spending | number:'1.0-0' }}</span>
                  </div>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="category.percentage > 100 ? 100 : category.percentage"
                    [class]="getStatusClass(category.percentage)">
                  </mat-progress-bar>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Spending Details Table -->
        <mat-card class="details-card">
          <mat-card-header>
            <mat-card-title>Spending Details</mat-card-title>
            <button mat-raised-button color="primary" (click)="exportToExcel()" class="export-btn">
              <mat-icon>download</mat-icon>
              Export to XLS
            </button>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="report.expenseDetails" class="details-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let expense">{{ expense.date | date:'MMM d, yyyy' }}</td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let expense">{{ expense.description }}</td>
                </ng-container>

                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let expense">
                    <div class="category-cell" *ngIf="expense.category">
                      <mat-icon [style.color]="expense.category.color">
                        {{ expense.category.icon }}
                      </mat-icon>
                      {{ expense.category.name }}
                    </div>
                    <span *ngIf="!expense.category">Uncategorized</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let expense" class="amount-cell">
                    \${{ expense.amount | number:'1.2-2' }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <div *ngIf="report.expenseDetails.length === 0" class="no-data">
                No expenses recorded for this month
              </div>
            </div>

            <div class="total-row" *ngIf="report.expenseDetails.length > 0">
              <span class="total-label">TOTAL</span>
              <span class="total-amount">\${{ report.totalSpending | number:'1.2-2' }}</span>
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
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 20px;
    }

    h1 {
      margin: 0;
    }

    .month-selector {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .month-selector mat-form-field {
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

    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: rgba(0, 0, 0, 0.4);
      font-size: 16px;
    }

    .top-categories-card {
      margin-bottom: 30px;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .category-item {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-info mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .category-name {
      font-weight: 500;
      font-size: 16px;
    }

    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }

    .progress-label .label {
      color: rgba(0, 0, 0, 0.6);
    }

    .progress-label .amount {
      font-weight: 500;
    }

    .budget-bar::ng-deep .mat-progress-bar-fill::after {
      background-color: #E0E0E0;
    }

    .spending-good::ng-deep .mat-progress-bar-fill::after {
      background-color: #4CAF50;
    }

    .spending-warning::ng-deep .mat-progress-bar-fill::after {
      background-color: #FF9800;
    }

    .spending-exceeded::ng-deep .mat-progress-bar-fill::after {
      background-color: #F44336;
    }

    .details-card {
      margin-bottom: 30px;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .export-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-container {
      overflow-x: auto;
      margin-bottom: 20px;
    }

    .details-table {
      width: 100%;
      border: 1px solid #e0e0e0;
    }

    .details-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
    }

    .category-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-cell mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .amount-cell {
      font-weight: 500;
      color: #3f51b5;
      text-align: right;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 2px solid #3f51b5;
      font-weight: 600;
      font-size: 16px;
    }

    .total-label {
      color: rgba(0, 0, 0, 0.87);
    }

    .total-amount {
      color: #3f51b5;
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .month-selector {
        flex-wrap: wrap;
      }

      .month-selector mat-form-field {
        width: 120px;
      }

      .chart-container {
        height: 300px;
        padding: 10px;
      }

      mat-card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .export-btn {
        width: 100%;
      }
    }
  `]
})
export class MonthlyReportsComponent implements OnInit {
  loading = true;
  report: MonthlyReport | null = null;
  displayedColumns = ['date', 'description', 'category', 'amount'];

  // Date selection
  selectedMonth: number;
  selectedYear: number;
  months = [
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
  years: number[] = [];

  // Pie Chart
  pieChartType: ChartType = 'doughnut';
  pieChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };
  pieChartOptions: ChartConfiguration['options'] = {
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
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  constructor(private monthlyReportService: MonthlyReportService) {
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedYear = today.getFullYear();
    
    // Generate years (current year and 5 years back)
    for (let i = 0; i <= 5; i++) {
      this.years.push(this.selectedYear - i);
    }
  }

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.monthlyReportService.getMonthlyReport(this.selectedYear, this.selectedMonth).subscribe({
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
    if (this.report && this.report.spendingByCategory.length > 0) {
      this.pieChartData = {
        labels: this.report.spendingByCategory.map(c => c.categoryName),
        datasets: [{
          data: this.report.spendingByCategory.map(c => c.amount),
          backgroundColor: this.report.spendingByCategory.map(c => c.color)
        }]
      };
    } else {
      this.pieChartData = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      };
    }
  }

  onMonthChange() {
    this.loadReport();
  }

  onYearChange() {
    this.loadReport();
  }

  getStatusClass(percentage: number): string {
    if (percentage >= 100) return 'spending-exceeded';
    if (percentage >= 80) return 'spending-warning';
    return 'spending-good';
  }

  exportToExcel() {
    this.monthlyReportService.exportMonthlyReport(this.selectedYear, this.selectedMonth).subscribe({
      next: (exportData) => {
        // Create worksheet from data with explicit column order
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData.data, {
          header: ['Date', 'Description', 'Category', 'Amount']
        });

        // Create workbook
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');

        // Generate filename
        const fileName = `monthly-report-${exportData.monthName.replace(/\s+/g, '-')}.xlsx`;

        // Save file
        XLSX.writeFile(wb, fileName);
      },
      error: (err) => {
        console.error('Error exporting report:', err);
      }
    });
  }

  get hasChartData(): boolean {
    return (this.pieChartData.labels?.length ?? 0) > 0;
  }
}
