import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget } from '../models/budget.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) {}

  getBudgets(period: string = 'monthly'): Observable<Budget[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<Budget[]>(this.apiUrl, { params });
  }

  getBudget(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  createBudget(budget: Budget): Observable<{ message: string; budget: Budget }> {
    return this.http.post<{ message: string; budget: Budget }>(this.apiUrl, budget);
  }

  updateBudget(id: number, budget: Partial<Budget>): Observable<{ message: string; budget: Budget }> {
    return this.http.put<{ message: string; budget: Budget }>(`${this.apiUrl}/${id}`, budget);
  }

  deleteBudget(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

