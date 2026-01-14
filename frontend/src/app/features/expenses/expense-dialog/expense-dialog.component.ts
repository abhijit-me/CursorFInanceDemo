import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense } from '../../../core/models/expense.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-expense-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Expense' : 'Add Expense' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="expenseForm">
        <mat-form-field class="form-field-full-width">
          <mat-label>Description</mat-label>
          <input matInput formControlName="description" required>
          <mat-error *ngIf="expenseForm.get('description')?.hasError('required')">
            Description is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" required>
          <span matPrefix>$&nbsp;</span>
          <mat-error *ngIf="expenseForm.get('amount')?.hasError('required')">
            Amount is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="categoryId" required>
            <mat-option *ngFor="let category of categories" [value]="category.id">
              <mat-icon>{{ category.icon }}</mat-icon>
              {{ category.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="expenseForm.get('categoryId')?.hasError('required')">
            Category is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" required>
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>

        <div class="file-upload">
          <button mat-stroked-button type="button" (click)="fileInput.click()">
            <mat-icon>attach_file</mat-icon>
            {{ selectedFile ? selectedFile.name : 'Upload Receipt' }}
          </button>
          <input #fileInput type="file" (change)="onFileSelected($event)" 
                 accept="image/*,.pdf" style="display: none;">
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" 
              [disabled]="expenseForm.invalid || saving">
        <span *ngIf="!saving">{{ isEditMode ? 'Update' : 'Save' }}</span>
        <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }

    .file-upload {
      margin: 15px 0;
    }

    mat-option mat-icon {
      vertical-align: middle;
      margin-right: 8px;
    }
  `]
})
export class ExpenseDialogComponent implements OnInit {
  expenseForm: FormGroup;
  isEditMode = false;
  selectedFile: File | null = null;
  saving = false;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private dialogRef: MatDialogRef<ExpenseDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { expense?: Expense; categories: Category[] }
  ) {
    this.categories = data.categories;
    this.isEditMode = !!data.expense;

    this.expenseForm = this.fb.group({
      description: [data.expense?.description || '', Validators.required],
      amount: [data.expense?.amount || '', [Validators.required, Validators.min(0)]],
      categoryId: [data.expense?.categoryId || '', Validators.required],
      date: [data.expense?.date ? new Date(data.expense.date) : new Date(), Validators.required],
      notes: [data.expense?.notes || '']
    });
  }

  ngOnInit() {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSave() {
    if (this.expenseForm.valid) {
      this.saving = true;
      const expenseData = {
        ...this.expenseForm.value,
        date: this.formatDate(this.expenseForm.value.date)
      };

      if (this.isEditMode) {
        this.expenseService.updateExpense(this.data.expense!.id!, expenseData, this.selectedFile || undefined)
          .subscribe({
            next: () => {
              this.saving = false;
              this.snackBar.open('Expense updated successfully', 'Close', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: (error) => {
              this.saving = false;
              this.snackBar.open('Failed to update expense', 'Close', { duration: 3000 });
            }
          });
      } else {
        this.expenseService.createExpense(expenseData, this.selectedFile || undefined)
          .subscribe({
            next: () => {
              this.saving = false;
              this.snackBar.open('Expense created successfully', 'Close', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: (error) => {
              this.saving = false;
              this.snackBar.open('Failed to create expense', 'Close', { duration: 3000 });
            }
          });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

