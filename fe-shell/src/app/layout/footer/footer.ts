import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="footer sm:footer-horizontal items-center bg-base-200 text-base-content border-t border-base-300 px-4 py-6 sm:px-8">
      <aside class="items-center">
        <p class="font-semibold">fe-shell</p>
        <p class="text-sm text-base-content/70">© {{ year }} · Angular + NestJS Demo</p>
      </aside>
      <nav class="sm:justify-self-end">
        <div class="flex gap-4">
          <a routerLink="/" class="link link-hover">Home</a>
          <a href="https://github.com/nihaadk/ng-mf-nest" target="_blank" rel="noopener noreferrer" class="link link-hover">
            GitHub
          </a>
        </div>
      </nav>
    </footer>
  `
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
