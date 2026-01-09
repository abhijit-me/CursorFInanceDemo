import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecurringBillService } from '../../core/services/recurring-bill.service';
import { CategoryService } from '../../core/services/category.service';
import { RecurringBill } from '../../core/models/recurring-bill.model';
import { Category } from '../../core/models/category.model';
import { RecurringBillDialogComponent } from './recurring-bill-dialog/recurring-bill-dialog.component';

@Component({
  selector: 'app-recurring-bills',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="bills-container">
      <div class="header">
        <h1>Recurring Bills</h1>
        <button mat-raised-button color="primary" (click)="openBillDialog()">
          <mat-icon>add</mat-icon>
          Add Bill
        </button>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>

      <div class="bills-list" *ngIf="!loading">
        <mat-card *ngFor="let bill of bills" class="bill-card" 
                  [class.overdue]="bill.is_overdue"
                  [class.upcoming]="bill.needs_reminder">
          <mat-card-header>
            <div mat-card-avatar class="category-icon" 
                 [style.background-color]="bill.category?.color">
              <mat-icon>{{ bill.category?.icon || 'event_repeat' }}</mat-icon>
            </div>
            <mat-card-title>{{ bill.name }}</mat-card-title>
            <mat-card-subtitle>
              {{ bill.category?.name }} • {{ bill.frequency }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="bill-amount">\${{ bill.amount | number:'1.2-2' }}</div>
            
            <div class="bill-info">
              <div class="info-item">
                <mat-icon>event</mat-icon>
                <span>Due: {{ bill.next_due_date | date }}</span>
              </div>
              <div class="info-item" *ngIf="bill.days_until_due !== undefined">
                <mat-icon>schedule</mat-icon>
                <span>
                  {{ bill.is_overdue ? 'Overdue by ' + Math.abs(bill.days_until_due) : 
                     'In ' + bill.days_until_due }} days
                </span>
              </div>
            </div>

            <mat-chip-set>
              <mat-chip *ngIf="bill.is_overdue" class="overdue-chip">
                <mat-icon>error</mat-icon>
                Overdue
              </mat-chip>
              <mat-chip *ngIf="bill.needs_reminder && !bill.is_overdue" class="reminder-chip">
                <mat-icon>notifications</mat-icon>
                Due Soon
              </mat-chip>
              <mat-chip *ngIf="!bill.is_active" class="inactive-chip">
                Inactive
              </mat-chip>
            </mat-chip-set>

            <p *ngIf="bill.notes" class="bill-notes">{{ bill.notes }}</p>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button color="primary" (click)="markAsPaid(bill)">
              <mat-icon>check_circle</mat-icon>
              Mark Paid
            </button>
            <button mat-button (click)="openBillDialog(bill)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button color="warn" (click)="deleteBill(bill)">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>

        <div *ngIf="bills.length === 0" class="empty-state">
          <mat-icon>event_repeat</mat-icon>
          <h3>No recurring bills</h3>
          <p>Add your recurring bills to track and get reminders!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bills-container {
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

    .bills-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .bill-card {
      transition: transform 0.2s;
    }

    .bill-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .bill-card.overdue {
      border-left: 4px solid #F44336;
    }

    .bill-card.upcoming {
      border-left: 4px solid #FF9800;
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

    .bill-amount {
      font-size: 24px;
      font-weight: 500;
      color: #3f51b5;
      margin: 10px 0;
    }

    .bill-info {
      margin: 15px 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      color: rgba(0, 0, 0, 0.7);
    }

    .info-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-chip-set {
      margin: 10px 0;
    }

    .overdue-chip {
      background-color: #F44336;
      color: white;
    }

    .reminder-chip {
      background-color: #FF9800;
      color: white;
    }

    .inactive-chip {
      background-color: #9E9E9E;
      color: white;
    }

    .bill-notes {
      color: rgba(0, 0, 0, 0.6);
      margin: 10px 0;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .bills-list {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RecurringBillsComponent implements OnInit {
  bills: RecurringBill[] = [];
  categories: Category[] = [];
  loading = false;
  Math = Math;

  constructor(
    private billService: RecurringBillService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadBills();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  loadBills() {
    this.loading = true;
    this.billService.getBills().subscribe({
      next: (bills) => {
        this.bills = bills.sort((a, b) => {
          if (a.is_overdue && !b.is_overdue) return -1;
          if (!a.is_overdue && b.is_overdue) return 1;
          return new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime();
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load bills', 'Close', { duration: 3000 });
      }
    });
  }

  openBillDialog(bill?: RecurringBill) {
    const dialogRef = this.dialog.open(RecurringBillDialogComponent, {
      width: '500px',
      data: { bill, categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBills();
      }
    });
  }

  markAsPaid(bill: RecurringBill) {
    this.billService.markAsPaid(bill.id!).subscribe({
      next: () => {
        this.snackBar.open('Bill marked as paid', 'Close', { duration: 3000 });
        this.loadBills();
      },
      error: (error) => {
        this.snackBar.open('Failed to mark bill as paid', 'Close', { duration: 3000 });
      }
    });
  }

  deleteBill(bill: RecurringBill) {
    if (confirm('Are you sure you want to delete this bill?')) {
      this.billService.deleteBill(bill.id!).subscribe({
        next: () => {
          this.snackBar.open('Bill deleted successfully', 'Close', { duration: 3000 });
          this.loadBills();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete bill', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

