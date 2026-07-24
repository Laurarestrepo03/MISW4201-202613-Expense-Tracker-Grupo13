import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { DashboardService } from './dashboard.service';
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';
import { TransactionListComponent } from '../../shared/transaction-list/transaction-list.component';

/** Ruta /dashboard (solo lectura): 3 stat cards + Recent Transactions. */
@Component({
  selector: 'app-dashboard-page',
  imports: [StatCardComponent, TransactionListComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  protected readonly dashboard = inject(DashboardService);

  ngOnInit(): void {
    this.dashboard.load();
  }
}
