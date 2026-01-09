import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private cache$?: Observable<Category[]>;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Category[]>(this.apiUrl).pipe(
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  clearCache() {
    this.cache$ = undefined;
  }
}

