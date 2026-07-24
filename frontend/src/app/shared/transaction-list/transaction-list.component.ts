import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TransactionItem } from './transaction-item';

/** Card "Recent Transactions" del dashboard (§3.2): solo presentación. */
@Component({
  selector: 'app-transaction-list',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent {
  readonly transactions = input.required<TransactionItem[]>();
}
