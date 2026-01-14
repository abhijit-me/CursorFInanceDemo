import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SavingsGoalService } from '../../../core/services/savings-goal.service';
import { SavingsGoal } from '../../../core/models/savings-goal.model';

@Component({
  selector: 'app-savings-goal-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Savings Goal' : 'Create Savings Goal' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="goalForm">
        <mat-form-field class="form-field-full-width">
          <mat-label>Goal Name</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="goalForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Target Amount</mat-label>
          <input matInput type="number" formControlName="targetAmount" required>
          <span matPrefix>$&nbsp;</span>
          <mat-error *ngIf="goalForm.get('targetAmount')?.hasError('required')">
            Target amount is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Current Amount</mat-label>
          <input matInput type="number" formControlName="currentAmount">
          <span matPrefix>$&nbsp;</span>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Target Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="targetDate">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Icon</mat-label>
          <input matInput formControlName="icon" placeholder="e.g., home, flight, car">
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>Color</mat-label>
          <input matInput type="color" formControlName="color">
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" 
              [disabled]="goalForm.invalid || saving">
        <span *ngIf="!saving">{{ isEditMode ? 'Update' : 'Create' }}</span>
        <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class SavingsGoalDialogComponent implements OnInit {
  goalForm: FormGroup;
  isEditMode = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private goalService: SavingsGoalService,
    private dialogRef: MatDialogRef<SavingsGoalDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { goal?: SavingsGoal }
  ) {
    this.isEditMode = !!data.goal;

    this.goalForm = this.fb.group({
      name: [data.goal?.name || '', Validators.required],
      targetAmount: [data.goal?.targetAmount || '', [Validators.required, Validators.min(0)]],
      currentAmount: [data.goal?.currentAmount || 0, Validators.min(0)],
      targetDate: [data.goal?.targetDate ? new Date(data.goal.targetDate) : null],
      icon: [data.goal?.icon || 'savings'],
      color: [data.goal?.color || '#4CAF50']
    });
  }

  ngOnInit() {}

  onSave() {
    if (this.goalForm.valid) {
      this.saving = true;
      const goalData = {
        ...this.goalForm.value,
        targetDate: this.goalForm.value.targetDate ? this.formatDate(this.goalForm.value.targetDate) : null
      };

      if (this.isEditMode) {
        this.goalService.updateGoal(this.data.goal!.id!, goalData).subscribe({
          next: () => {
            this.saving = false;
            this.snackBar.open('Goal updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving = false;
            this.snackBar.open('Failed to update goal', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.goalService.createGoal(goalData).subscribe({
          next: () => {
            this.saving = false;
            this.snackBar.open('Goal created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.saving = false;
            this.snackBar.open('Failed to create goal', 'Close', { duration: 3000 });
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

