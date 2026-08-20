import { Component } from '@angular/core';

@Component({
  selector: 'app-widget',
  template: `
    <div class="card">
      <span class="badge">MFE-1</span>
      <h1>Hello from fe-mfe-1 👋</h1>
      <p>
        This card is rendered by a completely separate Angular application. It was
        loaded lazily at runtime by <strong>fe-shell</strong>
        via <strong>Native Federation</strong> — no shared build, no shared deploy.
      </p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    .card {
      max-width: 32rem;
      margin: 2rem auto;
      padding: 1.75rem;
      border: 1px solid #d9d9e3;
      border-radius: 0.75rem;
      background: #ffffff;
      color: #1f1f28;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    .badge {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      margin-bottom: 0.75rem;
      border-radius: 999px;
      background: #eef0ff;
      color: #4338ca;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    h1 {
      margin: 0 0 0.75rem;
      font-size: 1.5rem;
      font-weight: 600;
    }

    p {
      margin: 0;
      line-height: 1.5;
      color: #4b4b57;
    }

    /* Mirrors fe-shell's ThemeService, which sets data-theme on <html>. Since
       that's plain DOM state, it's visible across the app boundary even
       though this component ships in a separate Native Federation build. */
    :host-context([data-theme='dark']) .card {
      background: #1f2430;
      border-color: #333a4a;
      color: #e5e7eb;
    }

    :host-context([data-theme='dark']) .badge {
      background: #2c2f6b;
      color: #c7d2fe;
    }

    :host-context([data-theme='dark']) p {
      color: #a8adba;
    }
  `,
})
export class Widget {}
