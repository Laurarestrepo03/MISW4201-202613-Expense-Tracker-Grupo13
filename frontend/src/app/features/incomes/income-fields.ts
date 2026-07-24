import { DialogField } from '../../shared/form-dialog/dialog-field';
import { AMOUNT_FIELD, requiredTextField } from '../../shared/forms/common-fields';

/**
 * Campos del modal "Add an Income": Source + Amount, SIN fecha — el
 * income-service la sella en el servidor (PARIDAD §1). PRE-05 y PRE-06.
 */
export const INCOME_FIELDS: DialogField[] = [
  // PRE-05: requerido, no vacío tras trim, máx 200
  requiredTextField('source', 'Source', 'e.g. Freelance Project'),
  // PRE-06: numérico, > 0 (unificado a > 0, fiel a Expense.java)
  AMOUNT_FIELD,
];
