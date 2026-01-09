import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, ExpenseFilter } from '../models/expense.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getExpenses(filter?: ExpenseFilter): Observable<Expense[]> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.category_id) {
        params = params.set('category_id', filter.category_id.toString());
      }
      if (filter.start_date) {
        params = params.set('start_date', filter.start_date);
      }
      if (filter.end_date) {
        params = params.set('end_date', filter.end_date);
      }
    }

    return this.http.get<Expense[]>(this.apiUrl, { params });
  }

  getExpense(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  createExpense(expense: Expense, receipt?: File): Observable<{ message: string; expense: Expense }> {
    const formData = new FormData();
    formData.append('amount', expense.amount.toString());
    formData.append('description', expense.description);
    formData.append('category_id', expense.category_id.toString());
    formData.append('date', expense.date);
    
    if (expense.notes) {
      formData.append('notes', expense.notes);
    }
    if (receipt) {
      formData.append('receipt', receipt);
    }
    if (expense.is_recurring !== undefined) {
      formData.append('is_recurring', expense.is_recurring.toString());
    }

    return this.http.post<{ message: string; expense: Expense }>(this.apiUrl, formData);
  }

  updateExpense(id: number, expense: Partial<Expense>, receipt?: File): Observable<{ message: string; expense: Expense }> {
    const formData = new FormData();
    
    if (expense.amount !== undefined) {
      formData.append('amount', expense.amount.toString());
    }
    if (expense.description) {
      formData.append('description', expense.description);
    }
    if (expense.category_id !== undefined) {
      formData.append('category_id', expense.category_id.toString());
    }
    if (expense.date) {
      formData.append('date', expense.date);
    }
    if (expense.notes !== undefined) {
      formData.append('notes', expense.notes);
    }
    if (receipt) {
      formData.append('receipt', receipt);
    }
    if (expense.is_recurring !== undefined) {
      formData.append('is_recurring', expense.is_recurring.toString());
    }

    return this.http.put<{ message: string; expense: Expense }>(`${this.apiUrl}/${id}`, formData);
  }

  deleteExpense(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getReceiptUrl(filename: string): string {
    return `${this.apiUrl}/receipts/${filename}`;
  }
}

