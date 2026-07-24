import { Validators } from '@angular/forms';

import { DialogField } from '../../shared/form-dialog/dialog-field';
import { AMOUNT_FIELD, requiredTextField } from '../../shared/forms/common-fields';

/**
 * Campos del modal "Add an Expense". Validadores = tabla de
 * docs/PARIDAD-Y-PRECONDICIONES.md §3 (PRE-01…PRE-04), ni más ni menos.
 */
export const EXPENSE_FIELDS: DialogField[] = [
  // PRE-01: requerido, no vacío tras trim, máx 200
  requiredTextField('title', 'Title', 'e.g. Grocery Shopping'),
  // PRE-02: numérico, > 0 (input numérico: imposible enviar texto)
  AMOUNT_FIELD,
  {
    key: 'date',
    label: 'Date',
    type: 'date',
    // PRE-03: requerida, ISO garantizado por el date picker nativo
    validators: [Validators.required],
    errorMessages: { required: 'Date is required.' },
  },
  {
    key: 'note',
    label: 'Note (optional)',
    type: 'textarea',
    // PRE-04: opcional, máx 500
    validators: [Validators.maxLength(500)],
    errorMessages: { maxlength: 'Note must be at most 500 characters.' },
  },
];
