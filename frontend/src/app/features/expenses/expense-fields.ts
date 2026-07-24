import { Validators } from '@angular/forms';

import { DialogField } from '../../shared/form-dialog/dialog-field';
import { requiredTrimmed } from '../../shared/forms/required-trimmed';

/**
 * Campos del modal "Add an Expense". Validadores = tabla de
 * docs/PARIDAD-Y-PRECONDICIONES.md §3 (PRE-01…PRE-04), ni más ni menos.
 */
export const EXPENSE_FIELDS: DialogField[] = [
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g. Grocery Shopping',
    // PRE-01: requerido, no vacío tras trim, máx 200
    validators: [requiredTrimmed, Validators.maxLength(200)],
    errorMessages: {
      required: 'Title is required.',
      maxlength: 'Title must be at most 200 characters.',
    },
  },
  {
    key: 'amount',
    label: 'Amount ($)',
    type: 'number',
    placeholder: '0.00',
    step: '0.01',
    // PRE-02: numérico, > 0 (input numérico: imposible enviar texto)
    validators: [Validators.required, Validators.min(0.01)],
    errorMessages: {
      required: 'Amount is required.',
      min: 'Amount must be greater than 0.',
    },
  },
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
