import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const session = authService.currentUser();
  
  // Create correlation ID for request tracing
  const correlationId = 'fifa-ui-' + Math.random().toString(36).substring(2, 15);
  let headers = req.headers.set('X-Correlation-Id', correlationId);

  // If a JWT token exists, inject it into the Authorization header
  if (session && session.token) {
    headers = headers.set('Authorization', `Bearer ${session.token}`);
  }

  const clonedRequest = req.clone({ headers });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // If unauthorized (401), force user logout
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
