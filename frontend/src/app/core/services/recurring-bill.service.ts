import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecurringBill } from '../models/recurring-bill.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecurringBillService {
  private apiUrl = `${environment.apiUrl}/recurring-bills`;

  constructor(private http: HttpClient) {}

  getBills(): Observable<RecurringBill[]> {
    return this.http.get<RecurringBill[]>(this.apiUrl);
  }

  getBill(id: number): Observable<RecurringBill> {
    return this.http.get<RecurringBill>(`${this.apiUrl}/${id}`);
  }

  createBill(bill: RecurringBill): Observable<{ message: string; bill: RecurringBill }> {
    return this.http.post<{ message: string; bill: RecurringBill }>(this.apiUrl, bill);
  }

  updateBill(id: number, bill: Partial<RecurringBill>): Observable<{ message: string; bill: RecurringBill }> {
    return this.http.put<{ message: string; bill: RecurringBill }>(`${this.apiUrl}/${id}`, bill);
  }

  deleteBill(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  markAsPaid(id: number): Observable<{ message: string; bill: RecurringBill }> {
    return this.http.post<{ message: string; bill: RecurringBill }>(`${this.apiUrl}/${id}/pay`, {});
  }
}

