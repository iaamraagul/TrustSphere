import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'trustsphere_theme';
  private readonly modeSubject = new BehaviorSubject<ThemeMode>(this.getInitialMode());
  mode$ = this.modeSubject.asObservable();

  constructor() {
    this.applyTheme(this.modeSubject.value);
  }

  get mode(): ThemeMode {
    return this.modeSubject.value;
  }

  toggle(): void {
    this.setTheme(this.mode === 'dark' ? 'light' : 'dark');
  }

  setTheme(mode: ThemeMode): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.storageKey, mode);
    }
    this.modeSubject.next(mode);
    this.applyTheme(mode);
  }

  private getInitialMode(): ThemeMode {
    if (!this.isBrowser()) {
      return 'dark';
    }

    const saved = localStorage.getItem(this.storageKey) as ThemeMode | null;
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  }

  private applyTheme(mode: ThemeMode): void {
    if (!this.isBrowser()) {
      return;
    }

    document.documentElement.dataset['theme'] = mode;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}
