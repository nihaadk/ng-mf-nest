import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="hero min-h-[70vh] bg-base-200">
      <div class="hero-content w-full max-w-sm">
        <div class="card w-full bg-base-100 shadow-md">
          <div class="card-body">
            <h1 class="card-title">Login</h1>

            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <fieldset class="fieldset">
                <label class="label" for="email">E-Mail</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="input input-bordered w-full"
                  autocomplete="email"
                  [attr.aria-invalid]="isInvalid('email')"
                />
                @if (isInvalid('email')) {
                  <p class="text-error text-sm mt-1">Bitte eine gültige E-Mail-Adresse eingeben.</p>
                }

                <label class="label mt-2" for="password">Passwort</label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  class="input input-bordered w-full"
                  autocomplete="current-password"
                  [attr.aria-invalid]="isInvalid('password')"
                />
                @if (isInvalid('password')) {
                  <p class="text-error text-sm mt-1">Passwort wird benötigt.</p>
                }
              </fieldset>

              @if (errorMessage()) {
                <div class="alert alert-error mt-4" role="alert">
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="form.invalid || loading()">
                @if (loading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                }
                Login
              </button>
            </form>

            <p class="text-sm text-base-content/70 mt-2">Demo-Zugang: demo&#64;example.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  protected isInvalid(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/');
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.status === 401 ? 'Ungültige Zugangsdaten.' : 'Login fehlgeschlagen. Bitte später erneut versuchen.'
        );
      }
    });
  }
}
