import { AbstractControl, ValidationErrors } from '@angular/forms';

/** required que rechaza valores vacíos tras trim (PRE-01 y PRE-05). */
export function requiredTrimmed(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').trim().length > 0 ? null : { required: true };
}
