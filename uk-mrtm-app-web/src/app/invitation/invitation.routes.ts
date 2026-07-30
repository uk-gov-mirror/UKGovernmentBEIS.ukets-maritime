import { Routes } from '@angular/router';

import { PendingRequestGuard } from '@core/guards/pending-request.guard';
import { RegulatorInvitationGuard } from '@invitation/regulator-invitation/regulator-invitation.guard';
import { VerifierInvitationGuard } from '@invitation/verifier-invitation/verifier-invitation.guard';

export const INVITATION_ROUTES: Routes = [
  {
    path: 'regulator',
    data: { blockSignInRedirect: true },
    children: [
      {
        path: '',
        title: 'Activate your account',
        canActivate: [RegulatorInvitationGuard],
        resolve: { invitedUser: RegulatorInvitationGuard },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () =>
          import('@invitation/regulator-invitation/regulator-invitation.component').then(
            (c) => c.RegulatorInvitationComponent,
          ),
      },
      {
        path: 'confirmed',
        title: "You've successfully activated your user account",
        loadComponent: () =>
          import('@invitation/invitation-confirmation/invitation-confirmation.component').then(
            (c) => c.InvitationConfirmationComponent,
          ),
      },
      {
        path: 'invalid-link',
        title: 'This link is invalid',
        loadComponent: () =>
          import('@invitation/invalid-link/invalid-link.component').then((c) => c.InvalidLinkComponent),
      },
    ],
  },
  {
    path: 'verifier',
    data: { blockSignInRedirect: true },
    children: [
      {
        path: '',
        title: 'Activate your account',
        canActivate: [VerifierInvitationGuard],
        resolve: { invitedUser: VerifierInvitationGuard },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () =>
          import('@invitation/verifier-invitation/verifier-invitation.component').then(
            (c) => c.VerifierInvitationComponent,
          ),
      },
      {
        path: 'confirmed',
        title: "You've successfully activated your user account",
        loadComponent: () =>
          import('@invitation/invitation-confirmation/invitation-confirmation.component').then(
            (c) => c.InvitationConfirmationComponent,
          ),
      },
      {
        path: 'invalid-link',
        title: 'This link is invalid',
        loadComponent: () =>
          import('@invitation/invalid-link/invalid-link.component').then((c) => c.InvalidLinkComponent),
      },
    ],
  },
];
