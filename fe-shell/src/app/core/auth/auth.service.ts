import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface PublicUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

const TOKEN_STORAGE_KEY = 'auth_token';

/**
 * Verbindet den Client mit der be-shell Auth-API (/auth/login, /auth/logout, /auth/me).
 * Hält Token und eingeloggten User als Signals und persistiert das Token in localStorage,
 * damit die Session einen Reload übersteht.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly token = signal<string | null>(this.readStoredToken());
  private readonly user = signal<PublicUser | null>(null);

  readonly currentUser = this.user.asReadonly();
  readonly isAuthenticated = computed(() => this.token() !== null);

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/login', credentials).pipe(
      tap((response) => this.setSession(response))
    );
  }

  logout(): void {
    const token = this.token();
    if (token) {
      this.http.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } }).subscribe();
    }
    this.clearSession();
  }

  /** Lädt den eingeloggten User anhand des gespeicherten Tokens (z. B. nach einem Reload). */
  loadCurrentUser(): Observable<PublicUser> {
    const token = this.token();
    return this.http
      .get<PublicUser>('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .pipe(tap((user) => this.user.set(user)));
  }

  private setSession(response: AuthResponse): void {
    this.token.set(response.token);
    this.user.set(response.user);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
  }

  private clearSession(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private readStoredToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }
}
