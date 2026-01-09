import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { Budget } from '../../core/models/budget.model';
import { Category } from '../../core/models/category.model';
import { BudgetDialogComponent } from './budget-dialog/budget-dialog.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="budgets-container">
      <div class="header">
        <h1>Budgets</h1>
        <button mat-raised-button color="primary" (click)="openBudgetDialog()">
          <mat-icon>add</mat-icon>
          Add Budget
        </button>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>

      <div class="budgets-grid" *ngIf="!loading">
        <mat-card *ngFor="let budget of budgets" class="budget-card">
          <mat-card-header>
            <div mat-card-avatar class="category-icon" 
                 [style.background-color]="budget.category?.color">
              <mat-icon>{{ budget.category?.icon || 'account_balance_wallet' }}</mat-icon>
            </div>
            <mat-card-title>{{ budget.category?.name }}</mat-card-title>
            <mat-card-subtitle>Monthly Budget</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="budget-amounts">
              <div class="amount-item">
                <span class="label">Budget</span>
                <span class="value">\${{ budget.amount | number:'1.2-2' }}</span>
              </div>
              <div class="amount-item">
                <span class="label">Spent</span>
                <span class="value" [class]="getStatusClass(budget)">\${{ budget.spent | number:'1.2-2' }}</span>
              </div>
              <div class="amount-item">
                <span class="label">Remaining</span>
                <span class="value">\${{ budget.remaining | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="progress-section">
              <div class="progress-header">
                <span>{{ budget.percentage | number:'1.0-0' }}% Used</span>
                <mat-icon [class]="getStatusClass(budget)">
                  {{ getStatusIcon(budget) }}
                </mat-icon>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="budget.percentage"
                [class]="getStatusClass(budget)">
              </mat-progress-bar>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="openBudgetDialog(budget)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button color="warn" (click)="deleteBudget(budget)">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>

        <div *ngIf="budgets.length === 0" class="empty-state">
          <mat-icon>account_balance_wallet</mat-icon>
          <h3>No budgets set</h3>
          <p>Create your first budget to start tracking your spending!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .budgets-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h1 {
      margin: 0;
    }

    .loading-card {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .budgets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .budget-card {
      transition: transform 0.2s;
    }

    .budget-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .category-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: white;
    }

    .budget-amounts {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
    }

    .amount-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .amount-item .label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 5px;
    }

    .amount-item .value {
      font-size: 18px;
      font-weight: 500;
    }

    .progress-section {
      margin-top: 15px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .good {
      color: #4CAF50;
    }

    .warning {
      color: #FF9800;
    }

    .exceeded {
      color: #F44336;
    }

    mat-progress-bar.good::ng-deep .mat-progress-bar-fill::after {
      background-color: #4CAF50;
    }

    mat-progress-bar.warning::ng-deep .mat-progress-bar-fill::after {
      background-color: #FF9800;
    }

    mat-progress-bar.exceeded::ng-deep .mat-progress-bar-fill::after {
      background-color: #F44336;
    }

    @media (max-width: 768px) {
      .budgets-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  categories: Category[] = [];
  loading = false;

  constructor(
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadBudgets();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  loadBudgets() {
    this.loading = true;
    this.budgetService.getBudgets().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load budgets', 'Close', { duration: 3000 });
      }
    });
  }

  openBudgetDialog(budget?: Budget) {
    const dialogRef = this.dialog.open(BudgetDialogComponent, {
      width: '500px',
      data: { budget, categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBudgets();
      }
    });
  }

  deleteBudget(budget: Budget) {
    if (confirm('Are you sure you want to delete this budget?')) {
      this.budgetService.deleteBudget(budget.id!).subscribe({
        next: () => {
          this.snackBar.open('Budget deleted successfully', 'Close', { duration: 3000 });
          this.loadBudgets();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete budget', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusClass(budget: Budget): string {
    if (!budget.percentage) return 'good';
    if (budget.percentage >= 100) return 'exceeded';
    if (budget.percentage >= 80) return 'warning';
    return 'good';
  }

  getStatusIcon(budget: Budget): string {
    const status = this.getStatusClass(budget);
    if (status === 'exceeded') return 'error';
    if (status === 'warning') return 'warning';
    return 'check_circle';
  }
}

