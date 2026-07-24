import { ValidatorFn } from '@angular/forms';

/**
 * Descriptor de campo para FormDialog. Cada feature declara sus campos y
 * validadores (PRE-XX de docs/PARIDAD-Y-PRECONDICIONES.md); el diálogo
 * construye el formulario y lo renderiza — el markup existe UNA sola vez.
 */
export interface DialogField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  /** step de inputs numéricos (p. ej. '0.01' para montos). */
  step?: string;
  validators?: ValidatorFn[];
  /** Mensaje por clave de error del validador (p. ej. { required: '...' }). */
  errorMessages?: Record<string, string>;
}
