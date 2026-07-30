import { Routes } from '@angular/router';

export const FORGOT_PASSWORD_ROUTES: Routes = [
  {
    path: '',
    title: 'Forgot password',
    data: { breadcrumb: true },
    loadComponent: () =>
      import('@forgot-password/submit-email/submit-email.component').then((c) => c.SubmitEmailComponent),
  },
  {
    path: 'invalid-link',
    title: 'This link is invalid',
    data: { breadcrumb: true },
    loadComponent: () =>
      import('@forgot-password/email-link-invalid/email-link-invalid.component').then(
        (c) => c.EmailLinkInvalidComponent,
      ),
  },
  {
    path: 'reset-password',
    title: 'Reset password',
    data: { breadcrumb: true },
    loadComponent: () =>
      import('@forgot-password/reset-password/reset-password.component').then((c) => c.ResetPasswordComponent),
  },
  {
    path: 'otp',
    title: 'Submit otp',
    data: { breadcrumb: true },
    loadComponent: () => import('@forgot-password/submit-otp/submit-otp.component').then((c) => c.SubmitOtpComponent),
  },
];
