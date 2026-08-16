import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="hero min-h-[70vh] bg-base-200 px-4">
      <div class="hero-content text-center">
        <div class="max-w-lg">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold">fe-shell</h1>
          <p class="py-4 sm:py-6 text-base-content/70">
            A demo application showcasing a microfrontend architecture built with
            <span class="font-semibold text-base-content">Native Federation</span>.
          </p>
          <div class="flex flex-wrap justify-center gap-2 pb-4">
            <span class="badge badge-outline">Angular</span>
            <span class="badge badge-outline">NestJS</span>
            <span class="badge badge-outline">Native Federation</span>
          </div>
          @if (auth.isAuthenticated()) {
            <p>
              Logged in as
              <span class="font-semibold">{{ auth.currentUser()?.name ?? auth.currentUser()?.email }}</span>.
            </p>
          } @else {
            <p>Sign in to continue.</p>
          }
        </div>
      </div>
    </div>
  `
})
export class Home {
  protected readonly auth = inject(AuthService);
}
