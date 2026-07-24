import { Injectable, signal } from '@angular/core';

/** Estado global de la franja roja de error que se muestra sobre la navbar. */
@Injectable({ providedIn: 'root' })
export class ErrorBannerService {
  private readonly messageSignal = signal<string | null>(null);

  /** Mensaje visible actualmente, o null si el banner está oculto. */
  readonly message = this.messageSignal.asReadonly();

  show(message: string): void {
    this.messageSignal.set(message);
  }

  dismiss(): void {
    this.messageSignal.set(null);
  }
}
