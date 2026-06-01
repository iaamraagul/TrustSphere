import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) {
      return false;
    }

    return !!localStorage.getItem('token');
  }

  getUser(): any {
    if (!this.isBrowser()) {
      return null;
    }

    const user = localStorage.getItem('user');

    return user ? JSON.parse(user) : null;
  }

  getRole(): string {
    const user = this.getUser();

    return user?.role || 'USER';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  logout(): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
