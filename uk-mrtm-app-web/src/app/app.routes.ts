import { ExtraOptions, Routes } from '@angular/router';

import {
  AuthGuard,
  canRedirectToSignIn,
  loggedInGuard,
  NonAuthGuard,
  PendingRequestGuard,
  TermsAndConditionsGuard,
} from '@core/guards';
import { DATA_SUPPLIERS_ROUTE_PREFIX } from '@data-suppliers/data-suppliers.constants';
import { canActivateDataSuppliers } from '@data-suppliers/data-suppliers.guards';
import { GUIDANCE_ROUTE_PREFIX } from '@guidance/guidance.constants';
import { landingPageGuard } from '@landing-page/landing-page.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'landing',
    title: 'Maritime',
    data: { breadcrumb: 'Home' },
    canActivate: [landingPageGuard],
    loadComponent: () => import('@landing-page/landing-page.component').then((c) => c.LandingPageComponent),
  },
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  },
  {
    path: '',
    data: { breadcrumb: 'Home' },
    children: [
      {
        path: 'about',
        title: 'About',
        data: { breadcrumb: true },
        loadComponent: () => import('@version/version.component').then((c) => c.VersionComponent),
      },
      {
        path: 'accessibility',
        title: 'Accessibility statement',
        data: { breadcrumb: true },
        loadComponent: () => import('@accessibility/accessibility.component').then((c) => c.AccessibilityComponent),
      },
      {
        path: 'legislation',
        title: 'Legislation',
        data: { breadcrumb: true },
        loadComponent: () => import('@legislation/legislation.component').then((c) => c.LegislationComponent),
      },
      {
        path: 'feedback',
        loadChildren: () => import('@feedback/feedback.routes').then((r) => r.FEEDBACK_ROUTES),
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('@forgot-password/forgot-password.routes').then((m) => m.FORGOT_PASSWORD_ROUTES),
      },
      {
        path: '2fa',
        loadChildren: () => import('@two-fa/two-fa.routes').then((m) => m.TWO_FA_ROUTES),
      },
      {
        path: 'registration',
        loadChildren: () => import('@registration/registration.routes').then((m) => m.REGISTRATION_ROUTES),
      },
    ],
  },
  {
    path: 'error',
    loadChildren: () => import('@netz/common/error').then((m) => m.ERROR_ROUTES),
  },
  {
    path: 'invitation',
    loadChildren: () => import('@invitation/invitation.routes').then((m) => m.INVITATION_ROUTES),
  },
  {
    path: 'timed-out',
    title: 'Session Timeout',
    canActivate: [NonAuthGuard],
    loadComponent: () => import('@timeout/timed-out').then((c) => c.TimedOutComponent),
  },
  {
    path: 'redirect-to-sign-in',
    canActivate: [canRedirectToSignIn],
    children: [],
  },
  {
    path: '',
    canActivate: [loggedInGuard, AuthGuard],
    data: { breadcrumb: 'Dashboard' },
    children: [
      {
        path: 'dashboard',
        title: 'Tasks',
        loadComponent: () => import('@shared/dashboard').then((c) => c.DashboardPageComponent),
      },
      {
        path: 'user',
        children: [
          {
            path: 'regulators',
            data: { breadcrumb: 'Regulator users' },
            loadChildren: () => import('@regulators/regulators.routes').then((m) => m.REGULATORS_ROUTES),
          },
          {
            path: 'verifiers',
            data: { breadcrumb: 'Manage verifier users' },
            loadChildren: () => import('@verifiers/verifiers.routes').then((m) => m.VERIFIERS_ROUTES),
          },
        ],
      },
      {
        path: 'tasks',
        loadChildren: () => import('@requests/tasks/tasks.routes').then((r) => r.TASKS_ROUTES),
      },
      {
        path: 'mi-reports',
        data: { breadcrumb: 'MI Reports' },
        loadChildren: () => import('@mi-reports/mi-reports.routes').then((m) => m.MI_REPORTS_ROUTES),
      },
      {
        path: 'accounts',
        data: { breadcrumb: 'Accounts' },
        loadChildren: () => import('@accounts/accounts.routes').then((m) => m.ACCOUNTS_ROUTES),
      },
      {
        path: 'verification-bodies',
        data: { breadcrumb: 'Manage verification bodies' },
        loadChildren: () =>
          import('./verification-bodies/verification-bodies.routes').then((m) => m.VERIFICATION_BODIES_ROUTES),
      },
      {
        path: 'templates',
        data: { breadcrumb: 'Templates' },
        loadChildren: () => import('@templates/templates.routes').then((r) => r.TEMPLATE_ROUTES),
      },
      {
        path: 'batch-variations',
        loadChildren: () => import('@batch-variations/batch-variations.routes').then((r) => r.BATCH_VARIATIONS_ROUTES),
      },
      {
        path: GUIDANCE_ROUTE_PREFIX,
        loadChildren: () => import('@guidance/guidance.routes').then((r) => r.GUIDANCE_ROUTES),
      },
      {
        path: DATA_SUPPLIERS_ROUTE_PREFIX,
        data: { breadcrumb: 'Manage data suppliers' },
        canActivate: [canActivateDataSuppliers],
        loadChildren: () => import('@data-suppliers/data-suppliers.routes').then((r) => r.DATA_SUPPLIERS_ROUTES),
      },
    ],
  },
  {
    path: 'terms',
    title: 'Accept terms and conditions',
    canActivate: [TermsAndConditionsGuard],
    canDeactivate: [PendingRequestGuard],
    loadComponent: () =>
      import('@terms-and-conditions/terms-and-conditions.component').then((c) => c.TermsAndConditionsComponent),
  },
  // The route below handles all unknown routes / Page Not Found functionality.
  // Please keep this route last else there will be unexpected behavior.
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export const routerOptions: ExtraOptions = {
  paramsInheritanceStrategy: 'always',
  // enableTracing: true,
};
