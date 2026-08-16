import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { Header } from './layout/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly authService = inject(AuthService);

  constructor() {
    // Session nach einem Reload wiederherstellen, falls ein Token gespeichert ist.
    if (this.authService.isAuthenticated()) {
      this.authService.loadCurrentUser().subscribe({ error: () => this.authService.logout() });
    }
  }
}
