import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SavingsGoalService } from '../../../core/services/savings-goal.service';
import { SavingsGoal } from '../../../core/models/savings-goal.model';

@Component({
  selector: 'app-contribute-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Contribute to {{ goal.name }}</h2>
    
    <mat-dialog-content>
      <div class="goal-info">
        <p><strong>Current:</strong> \${{ goal.current_amount | number:'1.2-2' }}</p>
        <p><strong>Target:</strong> \${{ goal.target_amount | number:'1.2-2' }}</p>
        <p><strong>Remaining:</strong> \${{ (goal.target_amount - goal.current_amount) | number:'1.2-2' }}</p>
      </div>

      <form [formGroup]="contributeForm">
        <mat-form-field class="form-field-full-width">
          <mat-label>Contribution Amount</mat-label>
          <input matInput type="number" formControlName="amount" required>
          <span matPrefix>$&nbsp;</span>
          <mat-error *ngIf="contributeForm.get('amount')?.hasError('required')">
            Amount is required
          </mat-error>
          <mat-error *ngIf="contributeForm.get('amount')?.hasError('min')">
            Amount must be positive
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" 
              [disabled]="contributeForm.invalid || saving">
        <span *ngIf="!saving">Contribute</span>
        <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 350px;
    }

    .goal-info {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .goal-info p {
      margin: 8px 0;
    }
  `]
})
export class ContributeDialogComponent {
  contributeForm: FormGroup;
  saving = false;
  goal: SavingsGoal;

  constructor(
    private fb: FormBuilder,
    private goalService: SavingsGoalService,
    private dialogRef: MatDialogRef<ContributeDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { goal: SavingsGoal }
  ) {
    this.goal = data.goal;
    this.contributeForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  onSave() {
    if (this.contributeForm.valid) {
      this.saving = true;
      const amount = this.contributeForm.value.amount;

      this.goalService.contribute(this.goal.id!, amount).subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open('Contribution added successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.saving = false;
          this.snackBar.open('Failed to add contribution', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

