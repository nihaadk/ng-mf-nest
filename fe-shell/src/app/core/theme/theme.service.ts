import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

/**
 * Verwaltet das aktive daisyUI-Theme (light/dark) als Signal, persistiert die Wahl
 * in localStorage und synchronisiert das `data-theme`-Attribut auf <html>.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.readInitialTheme());
  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      document.documentElement.setAttribute('data-theme', this._theme());
    });
  }

  toggle(): void {
    this.setTheme(this._theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  private readInitialTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
