import { Component } from '@angular/core';

@Component({
  selector: 'app-widget',
  template: `
    <div class="card">
      <span class="badge">fe-mfe-1</span>
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
  `,
})
export class Widget {}
