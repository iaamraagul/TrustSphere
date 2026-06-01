import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(page = 1, limit = 20, search = ''): Observable<any> {
    return this.http.get(this.api, {
      params: {
        page,
        limit,
        search,
      },
    });
  }

  addUser(userPayload: any): Observable<any> {
    return this.http.post(this.api, userPayload);
  }

  updateUser(userId: string, userPayload: any): Observable<any> {
    return this.http.put(`${this.api}/${userId}`, userPayload);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.api}/${userId}`);
  }
}
