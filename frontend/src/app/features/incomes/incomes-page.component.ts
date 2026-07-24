import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Placeholder de la Fase 1; el contenido real se construye en la Fase 3. */
@Component({
  selector: 'app-incomes-page',
  template: `<h2 class="page-title">List of Incomes</h2>`,
  styles: `
    .page-title {
      margin: 0;
      font-size: var(--text-3xl);
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomesPageComponent {}
