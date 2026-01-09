import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MonthlyReport } from '../models/monthly-report.model';

@Injectable({
  providedIn: 'root'
})
export class MonthlyReportService {
  private apiUrl = `${environment.apiUrl}/monthly-report`;

  constructor(private http: HttpClient) {}

  getMonthlyReport(year: number, month: number): Observable<MonthlyReport> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    
    return this.http.get<MonthlyReport>(this.apiUrl, { params });
  }
}

