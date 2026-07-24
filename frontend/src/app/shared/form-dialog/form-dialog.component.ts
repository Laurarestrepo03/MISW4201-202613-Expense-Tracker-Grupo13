import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { DialogField } from './dialog-field';

/**
 * Modal de formulario genérico (Add an Expense / Add an Income).
 * Un formulario inválido NO se envía (✱ CORRECCIÓN del legado); el botón
 * de submit se deshabilita con petición en vuelo (protege la carga).
 */
@Component({
  selector: 'app-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class FormDialogComponent {
  readonly title = input.required<string>();
  readonly fields = input.required<DialogField[]>();
  readonly submitLabel = input.required<string>();
  readonly pending = input(false);
  /** Errores 422 del backend por campo, mapeados al formulario (§8). */
  readonly fieldErrors = input<Record<string, string>>({});

  readonly closed = output<void>();
  readonly submitted = output<Record<string, unknown>>();

  protected readonly form = computed(() => this.buildForm(this.fields()));

  constructor() {
    effect(() => {
      const form = this.form();
      for (const [key, message] of Object.entries(this.fieldErrors())) {
        form.get(key)?.setErrors({ server: message });
      }
    });
  }

  protected submit(): void {
    const form = this.form();
    if (form.invalid || this.pending()) {
      form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.normalized(form.getRawValue()));
  }

  /** Los inputs con [type] dinámico entregan string: convierte los campos number. */
  private normalized(raw: Record<string, unknown>): Record<string, unknown> {
    const result = { ...raw };
    for (const field of this.fields()) {
      if (field.type === 'number' && result[field.key] !== '' && result[field.key] != null) {
        result[field.key] = Number(result[field.key]);
      }
    }
    return result;
  }

  protected errorFor(field: DialogField): string | null {
    const control = this.form().get(field.key);
    if (!control?.touched || !control.errors) {
      return null;
    }
    const [key, value] = Object.entries(control.errors)[0];
    return key === 'server' ? String(value) : (field.errorMessages?.[key] ?? 'Invalid value');
  }

  private buildForm(fields: DialogField[]): FormGroup {
    const controls: Record<string, FormControl> = {};
    for (const field of fields) {
      controls[field.key] = new FormControl('', { validators: field.validators ?? [] });
    }
    return new FormGroup(controls);
  }
}
