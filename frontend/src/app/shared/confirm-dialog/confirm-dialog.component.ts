import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Modal de confirmación de borrado. El feature arma las líneas
 * ("Confirm removal of {title}: ${amount}"; con N seleccionadas, la lista).
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cancelled.emit()' },
})
export class ConfirmDialogComponent {
  readonly lines = input.required<string[]>();
  readonly pending = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
