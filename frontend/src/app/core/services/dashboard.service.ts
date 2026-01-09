import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, SpendingByCategory, SpendingTrend } from '../models/dashboard.model';
import { Expense } from '../models/expense.model';
import { Budget } from '../models/budget.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getSpendingByCategory(period: string = 'month'): Observable<SpendingByCategory[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<SpendingByCategory[]>(`${this.apiUrl}/spending-by-category`, { params });
  }

  getSpendingTrend(period: string = '6months'): Observable<SpendingTrend[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<SpendingTrend[]>(`${this.apiUrl}/spending-trend`, { params });
  }

  getRecentExpenses(limit: number = 10): Observable<Expense[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Expense[]>(`${this.apiUrl}/recent-expenses`, { params });
  }

  getBudgetOverview(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/budget-overview`);
  }
}

