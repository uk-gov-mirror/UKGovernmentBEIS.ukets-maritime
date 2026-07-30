import { Routes } from '@angular/router';

import { PendingRequestGuard } from '@core/guards/pending-request.guard';
import { ClaimOperatorGuard } from '@registration/guards/claim-operator.guard';
import { ConfirmedEmailGuard } from '@registration/guards/confirmed-email.guard';

export const REGISTRATION_ROUTES: Routes = [
  {
    path: 'invitation',
    data: { blockSignInRedirect: true },
    children: [
      {
        path: '',
        title: 'You have been added as a user to this organisation account',
        canActivate: [ClaimOperatorGuard],
        resolve: { operatorInvitationResultData: ClaimOperatorGuard },
        pathMatch: 'full',
        loadComponent: () => import('@registration/invitation/invitation.component').then((c) => c.InvitationComponent),
      },
      {
        path: 'invalid-link',
        loadComponent: () =>
          import('@registration/invalid-invitation-link/invalid-invitation-link.component').then(
            (c) => c.InvalidInvitationLinkComponent,
          ),
      },
    ],
  },
  {
    path: 'user',
    canActivate: [ConfirmedEmailGuard],
    loadComponent: () =>
      import('@registration/user-registration/user-registration.component').then((c) => c.UserRegistrationComponent),
    children: [
      {
        path: 'contact-details',
        title: 'Enter your details',
        loadComponent: () =>
          import('@registration/contact-details/contact-details.component').then((c) => c.ContactDetailsComponent),
      },
      {
        path: 'choose-password',
        title: 'Choose a password',
        data: { backlink: '../contact-details' },
        loadComponent: () =>
          import('@registration/choose-password/choose-password.component').then((c) => c.ChoosePasswordComponent),
      },
      {
        path: 'summary',
        title: 'Check your answers',
        canDeactivate: [PendingRequestGuard],
        loadComponent: () => import('@registration/summary/summary.component').then((c) => c.SummaryComponent),
      },
      {
        path: 'success',
        title: "You've successfully created a user account",
        loadComponent: () => import('@registration/success/success.component').then((c) => c.SuccessComponent),
      },
    ],
  },
];
