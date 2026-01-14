import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ExpenseService } from '../../core/services/expense.service';
import { CategoryService } from '../../core/services/category.service';
import { Expense } from '../../core/models/expense.model';
import { Category } from '../../core/models/category.model';
import { ExpenseDialogComponent } from './expense-dialog/expense-dialog.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="expenses-container">
      <div class="header">
        <h1>Expenses</h1>
        <button mat-raised-button color="primary" (click)="openExpenseDialog()">
          <mat-icon>add</mat-icon>
          Add Expense
        </button>
      </div>

      <mat-card class="filter-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filter-form">
            <mat-form-field>
              <mat-label>Category</mat-label>
              <mat-select formControlName="categoryId" (selectionChange)="applyFilters()">
                <mat-option [value]="null">All Categories</mat-option>
                <mat-option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate" 
                     (dateChange)="applyFilters()">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field>
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate" 
                     (dateChange)="applyFilters()">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>

            <button mat-button (click)="clearFilters()">Clear Filters</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>

      <div class="expenses-list" *ngIf="!loading">
        <mat-card *ngFor="let expense of expenses" class="expense-card">
          <mat-card-header>
            <div mat-card-avatar class="category-icon" 
                 [style.background-color]="expense.category?.color">
              <mat-icon>{{ expense.category?.icon || 'receipt' }}</mat-icon>
            </div>
            <mat-card-title>{{ expense.description }}</mat-card-title>
            <mat-card-subtitle>
              {{ expense.category?.name }} • {{ expense.date | date }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="expense-amount">\${{ expense.amount | number:'1.2-2' }}</div>
            <p *ngIf="expense.notes" class="expense-notes">{{ expense.notes }}</p>
            <mat-chip-set *ngIf="expense.receiptPath">
              <mat-chip>
                <mat-icon>attach_file</mat-icon>
                Receipt attached
              </mat-chip>
            </mat-chip-set>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="openExpenseDialog(expense)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button color="warn" (click)="deleteExpense(expense)">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>

        <div *ngIf="expenses.length === 0" class="empty-state">
          <mat-icon>receipt_long</mat-icon>
          <h3>No expenses found</h3>
          <p>Start tracking your expenses by adding your first one!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .expenses-container {
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

    .filter-card {
      margin-bottom: 20px;
    }

    .filter-form {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-form mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .loading-card {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .expenses-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .expense-card {
      transition: transform 0.2s;
    }

    .expense-card:hover {
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

    .expense-amount {
      font-size: 24px;
      font-weight: 500;
      color: #4CAF50;
      margin: 10px 0;
    }

    .expense-notes {
      color: rgba(0, 0, 0, 0.6);
      margin: 5px 0;
    }

    mat-card-actions {
      display: flex;
      gap: 10px;
    }

    @media (max-width: 768px) {
      .expenses-list {
        grid-template-columns: 1fr;
      }

      .filter-form {
        flex-direction: column;
      }

      .filter-form mat-form-field {
        width: 100%;
      }
    }
  `]
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  categories: Category[] = [];
  filterForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      categoryId: [null],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadExpenses();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
      }
    });
  }

  loadExpenses() {
    this.loading = true;
    const filters = this.getFilters();
    
    this.expenseService.getExpenses(filters).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load expenses', 'Close', { duration: 3000 });
      }
    });
  }

  getFilters() {
    const formValue = this.filterForm.value;
    const filters: any = {};

    if (formValue.categoryId) {
      filters.categoryId = formValue.categoryId;
    }
    if (formValue.startDate) {
      filters.startDate = this.formatDate(formValue.startDate);
    }
    if (formValue.endDate) {
      filters.endDate = this.formatDate(formValue.endDate);
    }

    return filters;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  applyFilters() {
    this.loadExpenses();
  }

  clearFilters() {
    this.filterForm.reset();
    this.loadExpenses();
  }

  openExpenseDialog(expense?: Expense) {
    const dialogRef = this.dialog.open(ExpenseDialogComponent, {
      width: '500px',
      data: { expense, categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadExpenses();
      }
    });
  }

  deleteExpense(expense: Expense) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(expense.id!).subscribe({
        next: () => {
          this.snackBar.open('Expense deleted successfully', 'Close', { duration: 3000 });
          this.loadExpenses();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete expense', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

