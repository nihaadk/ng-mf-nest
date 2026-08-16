import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="hero min-h-[70vh] bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-4xl font-bold">Willkommen bei fe-shell</h1>
          @if (auth.isAuthenticated()) {
            <p class="py-6">
              Eingeloggt als
              <span class="font-semibold">{{ auth.currentUser()?.name ?? auth.currentUser()?.email }}</span>.
            </p>
          } @else {
            <p class="py-6">Melde dich an, um fortzufahren.</p>
          }
        </div>
      </div>
    </div>
  `
})
export class Home {
  protected readonly auth = inject(AuthService);
}
