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
import { RecurringBillService } from '../../../core/services/recurring-bill.service';
import { RecurringBill } from '../../../core/models/recurring-bill.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-recurring-bill-dialog',
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
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Recurring Bill' : 'Add Recurring Bill' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="billForm">
        <mat-form-field class="form-field-full-width">
          <mat-label>Bill Name</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="billForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" required>
          <span matPrefix>$&nbsp;</span>
          <mat-error *ngIf="billForm.get('amount')?.hasError('required')">
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
          <mat-error *ngIf="billForm.get('categoryId')?.hasError('required')">
            Category is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Frequency</mat-label>
          <mat-select formControlName="frequency" required>
            <mat-option value="weekly">Weekly</mat-option>
            <mat-option value="monthly">Monthly</mat-option>
            <mat-option value="yearly">Yearly</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Next Due Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="nextDueDate" required>
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Reminder Days Before</mat-label>
          <input matInput type="number" formControlName="reminderDays">
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>

        <mat-checkbox formControlName="isActive">Active</mat-checkbox>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" 
              [disabled]="billForm.invalid || saving">
        <span *ngIf="!saving">{{ isEditMode ? 'Update' : 'Save' }}</span>
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

    mat-checkbox {
      margin-top: 10px;
    }
  `]
})
export class RecurringBillDialogComponent implements OnInit {
  billForm: FormGroup;
  isEditMode = false;
  saving = false;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private billService: RecurringBillService,
    private dialogRef: MatDialogRef<RecurringBillDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { bill?: RecurringBill; categories: Category[] }
  ) {
    this.categories = data.categories;
    this.isEditMode = !!data.bill;

    this.billForm = this.fb.group({
      name: [data.bill?.name || '', Validators.required],
      amount: [data.bill?.amount || '', [Validators.required, Validators.min(0)]],
      categoryId: [data.bill?.categoryId || '', Validators.required],
      frequency: [data.bill?.frequency || 'monthly', Validators.required],
      nextDueDate: [data.bill?.nextDueDate ? new Date(data.bill.nextDueDate) : new Date(), Validators.required],
      reminderDays: [data.bill?.reminderDays || 3],
      notes: [data.bill?.notes || ''],
      isActive: [data.bill?.isActive !== undefined ? data.bill.isActive : true]
    });
  }

  ngOnInit() {}

  onSave() {
    if (this.billForm.valid) {
      this.saving = true;
      const billData = {
        ...this.billForm.value,
        nextDueDate: this.formatDate(this.billForm.value.nextDueDate)
      };

      if (this.isEditMode) {
        this.billService.updateBill(this.data.bill!.id!, billData).subscribe({
          next: () => {
            this.saving = false;
            this.snackBar.open('Bill updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving = false;
            this.snackBar.open('Failed to update bill', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.billService.createBill(billData).subscribe({
          next: () => {
            this.saving = false;
            this.snackBar.open('Bill created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving = false;
            this.snackBar.open('Failed to create bill', 'Close', { duration: 3000 });
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

