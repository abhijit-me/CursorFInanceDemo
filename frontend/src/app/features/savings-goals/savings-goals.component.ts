import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { SavingsGoalService } from '../../core/services/savings-goal.service';
import { SavingsGoal } from '../../core/models/savings-goal.model';
import { SavingsGoalDialogComponent } from './savings-goal-dialog/savings-goal-dialog.component';
import { ContributeDialogComponent } from './contribute-dialog/contribute-dialog.component';

@Component({
  selector: 'app-savings-goals',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="goals-container">
      <div class="header">
        <h1>Savings Goals</h1>
        <button mat-raised-button color="primary" (click)="openGoalDialog()">
          <mat-icon>add</mat-icon>
          Add Goal
        </button>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>

      <div class="goals-grid" *ngIf="!loading">
        <mat-card *ngFor="let goal of goals" class="goal-card" 
                  [class.completed]="goal.is_completed">
          <mat-card-header>
            <div mat-card-avatar class="goal-icon" 
                 [style.background-color]="goal.color">
              <mat-icon>{{ goal.icon || 'savings' }}</mat-icon>
            </div>
            <mat-card-title>{{ goal.name }}</mat-card-title>
            <mat-card-subtitle *ngIf="goal.target_date">
              Target: {{ goal.target_date | date }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="goal-amounts">
              <div class="amount-item">
                <span class="label">Current</span>
                <span class="value">\${{ goal.current_amount | number:'1.2-2' }}</span>
              </div>
              <div class="amount-item">
                <span class="label">Target</span>
                <span class="value">\${{ goal.target_amount | number:'1.2-2' }}</span>
              </div>
              <div class="amount-item">
                <span class="label">Remaining</span>
                <span class="value">\${{ (goal.target_amount - goal.current_amount) | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="progress-section">
              <div class="progress-header">
                <span>{{ goal.progress | number:'1.0-0' }}% Complete</span>
                <mat-icon *ngIf="goal.is_completed" class="completed-icon">check_circle</mat-icon>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="goal.progress"
                [color]="goal.is_completed ? 'accent' : 'primary'">
              </mat-progress-bar>
            </div>

            <mat-chip-set *ngIf="goal.is_completed">
              <mat-chip class="completed-chip">
                <mat-icon>celebration</mat-icon>
                Goal Achieved!
              </mat-chip>
            </mat-chip-set>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button color="primary" (click)="openContributeDialog(goal)" 
                    [disabled]="goal.is_completed">
              <mat-icon>add_circle</mat-icon>
              Contribute
            </button>
            <button mat-button (click)="openGoalDialog(goal)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button color="warn" (click)="deleteGoal(goal)">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>

        <div *ngIf="goals.length === 0" class="empty-state">
          <mat-icon>savings</mat-icon>
          <h3>No savings goals</h3>
          <p>Create your first savings goal and start building your future!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .goals-container {
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

    .goals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .goal-card {
      transition: transform 0.2s;
    }

    .goal-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .goal-card.completed {
      border: 2px solid #4CAF50;
    }

    .goal-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: white;
    }

    .goal-amounts {
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

    .completed-icon {
      color: #4CAF50;
    }

    .completed-chip {
      background-color: #4CAF50;
      color: white;
    }

    mat-chip-set {
      margin-top: 10px;
    }

    @media (max-width: 768px) {
      .goals-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SavingsGoalsComponent implements OnInit {
  goals: SavingsGoal[] = [];
  loading = false;

  constructor(
    private goalService: SavingsGoalService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.loading = true;
    this.goalService.getGoals().subscribe({
      next: (goals) => {
        this.goals = goals;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load goals', 'Close', { duration: 3000 });
      }
    });
  }

  openGoalDialog(goal?: SavingsGoal) {
    const dialogRef = this.dialog.open(SavingsGoalDialogComponent, {
      width: '500px',
      data: { goal }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGoals();
      }
    });
  }

  openContributeDialog(goal: SavingsGoal) {
    const dialogRef = this.dialog.open(ContributeDialogComponent, {
      width: '400px',
      data: { goal }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGoals();
      }
    });
  }

  deleteGoal(goal: SavingsGoal) {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.goalService.deleteGoal(goal.id!).subscribe({
        next: () => {
          this.snackBar.open('Goal deleted successfully', 'Close', { duration: 3000 });
          this.loadGoals();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete goal', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

