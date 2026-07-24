import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

/**
 * Mapa explícito recurso → base URL. Hay DOS microservicios independientes,
 * por eso dos bases distintas leídas del environment (ARQUITECTURA §9).
 * En dev ambas son '' y las rutas relativas pasan por proxy.conf.json.
 */
const API_BASES: Readonly<Record<string, string>> = {
  '/incomes': environment.incomeApiUrl,
  '/expenses': environment.expenseApiUrl,
};

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const prefix = Object.keys(API_BASES).find((path) => req.url.startsWith(path));
  const base = prefix ? API_BASES[prefix] : '';
  return next(base ? req.clone({ url: `${base}${req.url}` }) : req);
};
