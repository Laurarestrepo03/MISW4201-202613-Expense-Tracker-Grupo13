import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Tarjeta de cifra del dashboard (§3.2): primary = Current Balance (card azul),
 * success = Total Income, danger = Total Expenses.
 */
@Component({
  selector: 'app-stat-card',
  imports: [CurrencyPipe],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly variant = input<'primary' | 'success' | 'danger'>('primary');

  protected readonly cardClass = computed(() => `card stat-card stat-card--${this.variant()}`);
}
