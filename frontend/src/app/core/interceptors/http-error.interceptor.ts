import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ErrorBannerService } from '../error-banner.service';

export const SERVER_ERROR_MESSAGE = 'Unable to reach the server. Try again.';

/**
 * 5xx o fallo de red → banner global (sin reintentos automáticos).
 * Los 4xx (404, 422) pasan al feature, que los mapea al formulario.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const banner = inject(ErrorBannerService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0 || error.status >= 500) {
        banner.show(SERVER_ERROR_MESSAGE);
      }
      return throwError(() => error);
    }),
  );
};
