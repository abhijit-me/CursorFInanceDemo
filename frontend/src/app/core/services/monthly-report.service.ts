import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MonthlyReport, ExportData } from '../models/monthly-report.model';

@Injectable({
  providedIn: 'root'
})
export class MonthlyReportService {
  private apiUrl = `${environment.apiUrl}/monthly-report`;

  constructor(private http: HttpClient) {}

  getMonthlyReport(year?: number, month?: number): Observable<MonthlyReport> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    if (month) {
      params = params.set('month', month.toString());
    }
    return this.http.get<MonthlyReport>(this.apiUrl, { params });
  }

  exportMonthlyReport(year?: number, month?: number): Observable<ExportData> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    if (month) {
      params = params.set('month', month.toString());
    }
    return this.http.get<ExportData>(`${this.apiUrl}/export`, { params });
  }
}
