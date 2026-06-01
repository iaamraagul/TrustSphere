import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private metrics$?: Observable<any>;
  private analytics$?: Observable<any>;
  private activity$?: Observable<any>;

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<any> {
    this.metrics$ ??= this.http
      .get(`${environment.apiUrl}/dashboard/metrics`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

    return this.metrics$;
  }

  getAnalytics(): Observable<any> {
    this.analytics$ ??= this.http
      .get(`${environment.apiUrl}/dashboard/analytics`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

    return this.analytics$;
  }

  getActivity(): Observable<any> {
    this.activity$ ??= this.http
      .get(`${environment.apiUrl}/dashboard/activity`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

    return this.activity$;
  }

  refresh(): void {
    this.metrics$ = undefined;
    this.analytics$ = undefined;
    this.activity$ = undefined;
  }
}
