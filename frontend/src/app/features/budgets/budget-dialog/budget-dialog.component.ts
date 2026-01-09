import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BudgetService } from '../../../core/services/budget.service';
import { Budget } from '../../../core/models/budget.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-budget-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Budget' : 'Create Budget' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="budgetForm">
        <mat-form-field class="form-field-full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category_id" required [disabled]="isEditMode">
            <mat-option *ngFor="let category of categories" [value]="category.id">
              <mat-icon>{{ category.icon }}</mat-icon>
              {{ category.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="budgetForm.get('category_id')?.hasError('required')">
            Category is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Budget Amount</mat-label>
          <input matInput type="number" formControlName="amount" required>
          <span matPrefix>$&nbsp;</span>
          <mat-error *ngIf="budgetForm.get('amount')?.hasError('required')">
            Amount is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Period</mat-label>
          <mat-select formControlName="period" required>
            <mat-option value="monthly">Monthly</mat-option>
            <mat-option value="yearly">Yearly</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" 
              [disabled]="budgetForm.invalid || saving">
        <span *ngIf="!saving">{{ isEditMode ? 'Update' : 'Create' }}</span>
        <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }

    mat-option mat-icon {
      vertical-align: middle;
      margin-right: 8px;
    }
  `]
})
export class BudgetDialogComponent implements OnInit {
  budgetForm: FormGroup;
  isEditMode = false;
  saving = false;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private dialogRef: MatDialogRef<BudgetDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { budget?: Budget; categories: Category[] }
  ) {
    this.categories = data.categories;
    this.isEditMode = !!data.budget;

    this.budgetForm = this.fb.group({
      category_id: [{ value: data.budget?.category_id || '', disabled: this.isEditMode }, Validators.required],
      amount: [data.budget?.amount || '', [Validators.required, Validators.min(0)]],
      period: [data.budget?.period || 'monthly', Validators.required]
    });
  }

  ngOnInit() {}

  onSave() {
    if (this.budgetForm.valid) {
      this.saving = true;
      const budgetData = {
        ...this.budgetForm.getRawValue(),
        start_date: new Date().toISOString().split('T')[0]
      };

      if (this.isEditMode) {
        this.budgetService.updateBudget(this.data.budget!.id!, budgetData).subscribe({
          next: () => {
            this.saving = false;
            this.snackBar.open('Budget updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving = false;
            this.snackBar.open(error.error?.error || 'Failed to update budget', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.budgetService.createBudget(budgetData).subscribe({
          next: () => {
            this.saving = false;
            this.snackBar.open('Budget created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving = false;
            this.snackBar.open(error.error?.error || 'Failed to create budget', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

