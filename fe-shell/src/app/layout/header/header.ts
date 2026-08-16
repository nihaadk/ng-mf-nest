import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar bg-base-100 shadow-sm px-4">
      <div class="flex-1">
        <a routerLink="/" class="btn btn-ghost text-xl">fe-shell</a>
      </div>
      <nav class="flex-none">
        <ul class="menu menu-horizontal items-center gap-1 px-1">
          <li>
            <a routerLink="/" routerLinkActive="menu-active" [routerLinkActiveOptions]="{ exact: true }">
              Home
            </a>
          </li>
          @if (auth.isAuthenticated()) {
            <li class="px-2 text-sm text-base-content/70">
              {{ auth.currentUser()?.name ?? auth.currentUser()?.email }}
            </li>
            <li>
              <button type="button" class="btn btn-sm btn-outline" (click)="auth.logout()">
                Logout
              </button>
            </li>
          } @else {
            <li>
              <a routerLink="/login" routerLinkActive="menu-active" class="btn btn-sm btn-primary">
                Login
              </a>
            </li>
          }
        </ul>
      </nav>
    </header>
  `
})
export class Header {
  protected readonly auth = inject(AuthService);
}
