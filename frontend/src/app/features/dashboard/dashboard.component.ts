import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats, SpendingByCategory, SpendingTrend } from '../../core/models/dashboard.model';
import { Expense } from '../../core/models/expense.model';
import { Budget } from '../../core/models/budget.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTableModule,
    NgChartsModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>

      <div *ngIf="!loading">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-icon class="stat-icon">account_balance_wallet</mat-icon>
            <div class="stat-value">\${{ stats.total_expenses | number:'1.2-2' }}</div>
            <div class="stat-label">Total Expenses</div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon class="stat-icon">savings</mat-icon>
            <div class="stat-value">\${{ stats.budget_remaining | number:'1.2-2' }}</div>
            <div class="stat-label">Budget Remaining</div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon class="stat-icon">event_repeat</mat-icon>
            <div class="stat-value">{{ stats.upcoming_bills }}</div>
            <div class="stat-label">Upcoming Bills</div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon class="stat-icon">flag</mat-icon>
            <div class="stat-value">{{ stats.active_savings_goals }}</div>
            <div class="stat-label">Active Goals</div>
          </mat-card>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Spending by Category</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas baseChart
                  *ngIf="hasCategoryChartData"
                  [type]="categoryChartType"
                  [data]="categoryChartData"
                  [options]="categoryChartOptions">
                </canvas>
                <div *ngIf="!hasCategoryChartData" class="no-data">
                  No spending data available
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Spending Trend</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas baseChart
                  *ngIf="hasTrendChartData"
                  [type]="trendChartType"
                  [data]="trendChartData"
                  [options]="trendChartOptions">
                </canvas>
                <div *ngIf="!hasTrendChartData" class="no-data">
                  No trend data available
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Budget Overview -->
        <mat-card class="section-card" *ngIf="budgets.length > 0">
          <mat-card-header>
            <mat-card-title>Budget Overview</mat-card-title>
            <button mat-button color="primary" (click)="navigateTo('/budgets')">
              View All
            </button>
          </mat-card-header>
          <mat-card-content>
            <div class="budget-list">
              <div *ngFor="let budget of budgets.slice(0, 5)" class="budget-item">
                <div class="budget-header">
                  <span class="budget-name">{{ budget.category?.name }}</span>
                  <span class="budget-amounts">
                    \${{ budget.spent | number:'1.0-0' }} / \${{ budget.amount | number:'1.0-0' }}
                  </span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="budget.percentage"
                  [class]="getBudgetStatusClass(budget)">
                </mat-progress-bar>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Recent Expenses -->
        <mat-card class="section-card" *ngIf="recentExpenses.length > 0">
          <mat-card-header>
            <mat-card-title>Recent Expenses</mat-card-title>
            <button mat-button color="primary" (click)="navigateTo('/expenses')">
              View All
            </button>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="recentExpenses" class="expenses-table">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let expense">{{ expense.date | date:'short' }}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let expense">{{ expense.description }}</td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let expense">
                  <mat-icon [style.color]="expense.category?.color">
                    {{ expense.category?.icon }}
                  </mat-icon>
                  {{ expense.category?.name }}
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
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      margin-bottom: 20px;
    }

    .loading-card {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      text-align: center;
      padding: 30px 20px;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #3f51b5;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 500;
      margin: 10px 0;
    }

    .stat-label {
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .charts-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-card {
      min-height: 400px;
    }

    .chart-container {
      position: relative;
      height: 300px;
      padding: 10px;
    }

    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: rgba(0, 0, 0, 0.4);
    }

    .section-card {
      margin-bottom: 30px;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .budget-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .budget-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .budget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .budget-name {
      font-weight: 500;
    }

    .budget-amounts {
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .budget-good::ng-deep .mat-progress-bar-fill::after {
      background-color: #4CAF50;
    }

    .budget-warning::ng-deep .mat-progress-bar-fill::after {
      background-color: #FF9800;
    }

    .budget-exceeded::ng-deep .mat-progress-bar-fill::after {
      background-color: #F44336;
    }

    .expenses-table {
      width: 100%;
    }

    .amount-cell {
      font-weight: 500;
      color: #3f51b5;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .charts-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  stats: DashboardStats = {
    total_expenses: 0,
    total_budget: 0,
    budget_remaining: 0,
    budget_percentage: 0,
    upcoming_bills: 0,
    active_savings_goals: 0,
    total_saved: 0
  };
  budgets: Budget[] = [];
  recentExpenses: Expense[] = [];
  displayedColumns = ['date', 'description', 'category', 'amount'];

  // Category Chart
  categoryChartType: ChartType = 'doughnut';
  categoryChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };
  categoryChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // Trend Chart
  trendChartType: ChartType = 'line';
  trendChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: 'Monthly Spending',
      data: [],
      borderColor: '#3f51b5',
      backgroundColor: 'rgba(63, 81, 181, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
  trendChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    let completedRequests = 0;
    const totalRequests = 5;

    const checkComplete = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loading = false;
      }
    };

    // Load stats
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        checkComplete();
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        checkComplete();
      }
    });

    // Load spending by category
    this.dashboardService.getSpendingByCategory().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.categoryChartData = {
            labels: data.map(d => d.category_name),
            datasets: [{
              data: data.map(d => d.amount),
              backgroundColor: data.map(d => d.color)
            }]
          };
        }
        checkComplete();
      },
      error: (err) => {
        console.error('Error loading spending by category:', err);
        checkComplete();
      }
    });

    // Load spending trend
    this.dashboardService.getSpendingTrend().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.trendChartData = {
            labels: data.map(d => d.month),
            datasets: [{
              label: 'Monthly Spending',
              data: data.map(d => d.amount),
              borderColor: '#3f51b5',
              backgroundColor: 'rgba(63, 81, 181, 0.1)',
              tension: 0.4,
              fill: true
            }]
          };
        }
        checkComplete();
      },
      error: (err) => {
        console.error('Error loading spending trend:', err);
        checkComplete();
      }
    });

    // Load budget overview
    this.dashboardService.getBudgetOverview().subscribe({
      next: (budgets) => {
        this.budgets = budgets || [];
        checkComplete();
      },
      error: (err) => {
        console.error('Error loading budget overview:', err);
        this.budgets = [];
        checkComplete();
      }
    });

    // Load recent expenses
    this.dashboardService.getRecentExpenses(5).subscribe({
      next: (expenses) => {
        this.recentExpenses = expenses || [];
        checkComplete();
      },
      error: (err) => {
        console.error('Error loading recent expenses:', err);
        this.recentExpenses = [];
        checkComplete();
      }
    });
  }

  getBudgetStatusClass(budget: Budget): string {
    if (!budget.percentage) return 'budget-good';
    if (budget.percentage >= 100) return 'budget-exceeded';
    if (budget.percentage >= 80) return 'budget-warning';
    return 'budget-good';
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  get hasCategoryChartData(): boolean {
    return (this.categoryChartData.labels?.length ?? 0) > 0;
  }

  get hasTrendChartData(): boolean {
    return (this.trendChartData.labels?.length ?? 0) > 0;
  }
}

