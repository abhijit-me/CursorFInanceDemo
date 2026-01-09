import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <div class="app-container" *ngIf="isAuthenticated">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="drawer.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span>Finance Manager</span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #drawer mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/expenses" routerLinkActive="active">
              <mat-icon>receipt_long</mat-icon>
              <span>Expenses</span>
            </a>
            <a mat-list-item routerLink="/budgets" routerLinkActive="active">
              <mat-icon>account_balance_wallet</mat-icon>
              <span>Budgets</span>
            </a>
            <a mat-list-item routerLink="/recurring-bills" routerLinkActive="active">
              <mat-icon>event_repeat</mat-icon>
              <span>Recurring Bills</span>
            </a>
            <a mat-list-item routerLink="/savings-goals" routerLinkActive="active">
              <mat-icon>savings</mat-icon>
              <span>Savings Goals</span>
            </a>
            <a mat-list-item routerLink="/monthly-report" routerLinkActive="active">
              <mat-icon>assessment</mat-icon>
              <span>Monthly Report</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <div class="content">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>

    <div *ngIf="!isAuthenticated">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .sidenav-container {
      flex: 1;
    }

    .sidenav {
      width: 250px;
      padding-top: 20px;
    }

    .sidenav mat-list-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
    }

    .sidenav mat-list-item mat-icon {
      margin-right: 16px;
    }

    .sidenav mat-list-item.active {
      background-color: rgba(0, 0, 0, 0.04);
      color: #3f51b5;
    }

    .content {
      padding: 20px;
      min-height: 100%;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }
      
      .content {
        padding: 10px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

