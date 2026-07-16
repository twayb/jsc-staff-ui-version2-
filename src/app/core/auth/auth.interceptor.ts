import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;

  const authReq = token ? req.clone({ setHeaders: { 'jsc-token': token } }) : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && authService.isAuthenticated()) {
        authService.handleSessionTimeout();
      }
      return throwError(() => error);
    }),
  );
};
