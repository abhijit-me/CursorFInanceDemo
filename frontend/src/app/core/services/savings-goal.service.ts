import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SavingsGoal } from '../models/savings-goal.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SavingsGoalService {
  private apiUrl = `${environment.apiUrl}/savings-goals`;

  constructor(private http: HttpClient) {}

  getGoals(): Observable<SavingsGoal[]> {
    return this.http.get<SavingsGoal[]>(this.apiUrl);
  }

  getGoal(id: number): Observable<SavingsGoal> {
    return this.http.get<SavingsGoal>(`${this.apiUrl}/${id}`);
  }

  createGoal(goal: SavingsGoal): Observable<{ message: string; goal: SavingsGoal }> {
    return this.http.post<{ message: string; goal: SavingsGoal }>(this.apiUrl, goal);
  }

  updateGoal(id: number, goal: Partial<SavingsGoal>): Observable<{ message: string; goal: SavingsGoal }> {
    return this.http.put<{ message: string; goal: SavingsGoal }>(`${this.apiUrl}/${id}`, goal);
  }

  deleteGoal(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  contribute(id: number, amount: number): Observable<{ message: string; goal: SavingsGoal }> {
    return this.http.post<{ message: string; goal: SavingsGoal }>(`${this.apiUrl}/${id}/contribute`, { amount });
  }
}

