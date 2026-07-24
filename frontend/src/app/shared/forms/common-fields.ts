import { Validators } from '@angular/forms';

import { requiredTrimmed } from './required-trimmed';
import { DialogField } from '../form-dialog/dialog-field';

/**
 * Campo "Amount ($)" común: PRE-02 (expense) y PRE-06 (income) aplican la
 * MISMA regla (> 0, step 0.01) heredada de Expense.java — definido una vez.
 */
export const AMOUNT_FIELD: DialogField = {
  key: 'amount',
  label: 'Amount ($)',
  type: 'number',
  placeholder: '0.00',
  step: '0.01',
  validators: [Validators.required, Validators.min(0.01)],
  errorMessages: {
    required: 'Amount is required.',
    min: 'Amount must be greater than 0.',
  },
};

/** Texto requerido (trim, máx 200): PRE-01 (title) y PRE-05 (source). */
export function requiredTextField(key: string, label: string, placeholder: string): DialogField {
  return {
    key,
    label,
    type: 'text',
    placeholder,
    validators: [requiredTrimmed, Validators.maxLength(200)],
    errorMessages: {
      required: `${label} is required.`,
      maxlength: `${label} must be at most 200 characters.`,
    },
  };
}
