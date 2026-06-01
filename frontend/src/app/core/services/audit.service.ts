import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private api = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  getLogs(page = 1, limit = 25, search = ''): Observable<any> {
    return this.http.get(this.api, {
      params: {
        page,
        limit,
        search,
      },
    });
  }
}
