import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Estado vacío de las listas: mensaje + acción primaria de alta (PARIDAD §4). */
@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly message = input.required<string>();
  readonly actionLabel = input.required<string>();

  readonly action = output<void>();
}
