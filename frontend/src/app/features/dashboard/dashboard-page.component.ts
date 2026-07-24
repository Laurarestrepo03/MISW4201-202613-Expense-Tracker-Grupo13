import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Placeholder de la Fase 1; el contenido real se construye en la Fase 3. */
@Component({
  selector: 'app-dashboard-page',
  template: `<h1 class="page-title">Welcome!</h1>`,
  styles: `
    .page-title {
      margin: 0;
      font-size: var(--text-5xl);
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {}
