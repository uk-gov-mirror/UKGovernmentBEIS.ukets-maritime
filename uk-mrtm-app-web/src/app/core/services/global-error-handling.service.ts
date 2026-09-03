import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, NgZone, Service } from '@angular/core';
import { Router } from '@angular/router';

import { EMPTY, first, from, Observable, switchMap, throwError } from 'rxjs';

import { GenericServiceErrorCode, HttpStatuses } from '@netz/common/error';

import { AuthService } from '@core/services/auth.service';

@Service()
export class GlobalErrorHandlingService implements ErrorHandler {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  excludedUrls = ['.+/account/+\\w+/header-info$'];

  handleError(error: unknown): void {
    this.ngZone.run(() =>
      error instanceof HttpErrorResponse && error.status === HttpStatuses.NotFound
        ? this.router.navigate(['/error', '404'], { state: { forceNavigation: true } })
        : this.router.navigate(['/error', '500'], { state: { forceNavigation: true }, skipLocationChange: true }),
    );
    console.error('ERROR', error);
  }

  handleHttpError(res: HttpErrorResponse): Observable<never> {
    const urlContained = this.excludedUrls.some((url) => new RegExp(url).test(res.url));
    if (!urlContained) {
      switch (res.status) {
        case HttpStatuses.InternalServerError: {
          const state: { forceNavigation: boolean; errorCode?: string } = { forceNavigation: true };

          if (GenericServiceErrorCode[res.error?.code]) {
            state.errorCode = res.error?.code;
          }
          return from(
            this.router.navigate(['/error', '500'], {
              state,
              skipLocationChange: true,
            }),
          ).pipe(switchMap(() => EMPTY));
        }
        case HttpStatuses.Unauthorized:
          return from(this.authService.login()).pipe(switchMap(() => EMPTY));
        case HttpStatuses.Forbidden:
          /**
           * Handle explicitly case for file upload antiVirus check through AWS WAF,
           * as it returns status: 403, content-type: text/html, body: '<html>....'
           */
          if (res?.headers?.get('Content-Type') === 'text/html' && res?.error?.startsWith('<html')) {
            return throwError(() => res);
          }
          return this.authService.loadUserState().pipe(
            first(),
            switchMap(() => from(this.router.navigate(['landing'], { state: { forceNavigation: true } }))),
            switchMap(() => EMPTY),
          );
        default:
          return throwError(() => res);
      }
    } else {
      return throwError(() => res);
    }
  }
}
