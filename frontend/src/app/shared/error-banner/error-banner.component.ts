import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ErrorBannerService } from '../../core/error-banner.service';

/** Franja roja global de error sobre la navbar (ARQUITECTURA §3.2). */
@Component({
  selector: 'app-error-banner',
  templateUrl: './error-banner.component.html',
  styleUrl: './error-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorBannerComponent {
  protected readonly banner = inject(ErrorBannerService);
}
