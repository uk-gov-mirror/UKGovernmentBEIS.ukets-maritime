import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { AVAILABLE_ACTIONS_MAP } from '@accounts/containers/actions';
import { DATA_SUPPLIER_ROUTE_PREFIX } from '@accounts/containers/data-supplier';
import {
  AccountReportingStatusHistoryGuard,
  AppointVerifierGuard,
  canActivateEditReportingStatus,
  canActivateEditReportingStatusSummary,
  canActivateOperatorAccount,
  canActivateOperatorDetailsHistory,
  canDeactivateEditReportingStatus,
  canDeactivateOperatorAccount,
  CreateOperatorAccountGuard,
  CreateOperatorAccountSuccessGuard,
  CreateOperatorAccountSummaryGuard,
  createOperatorUserGuard,
  createOperatorUserSuccessGuard,
  createOperatorUserSummaryGuard,
  deleteUserAuthorityGuard,
  operatorUserGuard,
  ReplaceVerifierGuard,
} from '@accounts/guards';
import { userAuthorityResolver } from '@accounts/resolvers';
import { OperatorAccountsStore } from '@accounts/store';
import { PendingRequestGuard } from '@core/guards/pending-request.guard';

export const ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    title: 'Accounts',
    loadComponent: () => import('@accounts/containers').then((c) => c.AccountsPageComponent),
  },
  {
    path: 'create',
    title: 'Add an operator account',
    data: { breadcrumb: false },
    canActivate: [CreateOperatorAccountGuard],
    canDeactivate: [CreateOperatorAccountGuard],
    children: [
      {
        path: '',
        title: 'Operator account',
        data: { breadcrumb: false, backlink: '../' },
        loadComponent: () => import('@accounts/containers').then((c) => c.CreateOperatorAccountComponent),
      },
      {
        path: 'summary',
        title: 'Operator account summary',
        data: { breadcrumb: false, backlink: '../' },
        canActivate: [CreateOperatorAccountSummaryGuard],
        canDeactivate: [PendingRequestGuard],
        loadComponent: () => import('@accounts/containers').then((c) => c.CreateOperatorAccountSummaryComponent),
      },
      {
        path: 'success',
        title: 'You have successfully created an operator account',
        data: { breadcrumb: 'Dashboard' },
        canActivate: [CreateOperatorAccountSuccessGuard],
        loadComponent: () => import('@accounts/containers').then((c) => c.CreateOperatorAccountSuccessComponent),
      },
    ],
  },
  {
    path: ':accountId',
    canActivate: [canActivateOperatorAccount],
    canDeactivate: [canDeactivateOperatorAccount],
    title: 'Account',
    data: { breadcrumb: (data) => data.accountName },
    resolve: {
      accountName: () => inject(OperatorAccountsStore).getState().currentAccount.account.name,
    },
    children: [
      {
        path: '',
        loadComponent: () => import('@accounts/containers').then((c) => c.ViewOperatorAccountComponent),
      },
      {
        path: 'edit',
        title: 'Account',
        data: { breadcrumb: false, backlink: '../' },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () => import('@accounts/containers').then((c) => c.EditOperatorAccountComponent),
      },
      {
        path: 'edit-reporting-status/:reportingYear',
        title: 'Edit reporting status',
        data: { breadcrumb: false, backlink: '../../' },
        canActivate: [canActivateEditReportingStatus],
        canDeactivate: [canDeactivateEditReportingStatus],
        children: [
          { path: '', loadComponent: () => import('@accounts/containers').then((c) => c.EditReportingStatusComponent) },
          {
            path: 'summary',
            data: { breadcrumb: false, backlink: '../' },
            canActivate: [canActivateEditReportingStatusSummary],
            loadComponent: () =>
              import('@accounts/containers/edit-reporting-status-summary/edit-reporting-status-summary.component').then(
                (c) => c.EditReportingStatusSummaryComponent,
              ),
          },
        ],
      },
      {
        path: 'operator-details-history',
        title: 'Operator details history',
        data: { breadcrumb: true },
        canActivate: [canActivateOperatorDetailsHistory],
        loadComponent: () => import('@accounts/containers').then((c) => c.OperatorDetailsHistoryComponent),
      },
      {
        path: 'reporting-status-history',
        title: 'Reporting status history',
        data: { breadcrumb: true },
        canActivate: [AccountReportingStatusHistoryGuard],
        loadComponent: () => import('@accounts/containers').then((c) => c.AccountReportingStatusHistoryComponent),
      },
      {
        path: 'verification-body',
        children: [
          {
            path: 'appoint',
            title: 'Appoint a verifier',
            data: { breadcrumb: true },
            canActivate: [AppointVerifierGuard],
            canDeactivate: [PendingRequestGuard],
            loadComponent: () => import('@accounts/containers').then((c) => c.AppointComponent),
          },
          {
            path: 'replace',
            title: 'Replace a verifier',
            data: { breadcrumb: true },
            canActivate: [ReplaceVerifierGuard],
            canDeactivate: [PendingRequestGuard],
            resolve: { verificationBody: ReplaceVerifierGuard },
            loadComponent: () => import('@accounts/containers').then((c) => c.AppointComponent),
          },
        ],
      },
      {
        path: DATA_SUPPLIER_ROUTE_PREFIX,
        loadChildren: () => import('@accounts/containers/data-supplier').then((r) => r.DATA_SUPPLIER_ROUTES),
      },
      {
        path: 'users',
        children: [
          {
            path: ':userId',
            title: 'User account summary',
            canActivate: [operatorUserGuard],
            children: [
              {
                path: '',
                loadComponent: () => import('@accounts/containers').then((c) => c.UserAuthorityDetailsComponent),
              },
              {
                path: 'edit',
                title: 'Edit account',
                data: { breadcrumb: false, backlink: '../', backlinkFragment: 'users' },
                loadComponent: () => import('@accounts/containers').then((c) => c.EditUserAuthorityComponent),
              },
              {
                path: 'delete',
                title: 'Confirm that this user account will be deleted',
                data: {
                  breadcrumb: ({ userAuthority }) => `Delete ${userAuthority.firstName} ${userAuthority.lastName}`,
                },
                canActivate: [deleteUserAuthorityGuard],
                canDeactivate: [PendingRequestGuard],
                resolve: { userAuthority: userAuthorityResolver },
                loadComponent: () => import('@accounts/containers').then((c) => c.DeleteUserAuthorityComponent),
              },
            ],
          },
          {
            path: 'add/:userType',
            canDeactivate: [createOperatorUserGuard],
            children: [
              {
                path: '',
                data: { breadcrumb: false, backlink: '../../../', backlinkFragment: 'users' },
                title: 'User account',
                loadComponent: () => import('@accounts/containers').then((c) => c.CreateUserAuthorityComponent),
              },
              {
                path: 'summary',
                data: { breadcrumb: false, backlink: '../' },
                title: 'User account summary',
                canActivate: [createOperatorUserSummaryGuard],
                loadComponent: () => import('@accounts/containers').then((c) => c.CreateUserAuthoritySummaryComponent),
              },
              {
                path: 'success',
                title: 'You have successfully created a user account',
                data: { breadcrumb: 'Dashboard' },
                canActivate: [createOperatorUserSuccessGuard],
                loadComponent: () => import('@accounts/containers').then((c) => c.CreateUserAuthoritySuccessComponent),
              },
            ],
          },
        ],
      },
      {
        path: 'process-actions',
        title: 'Account process actions',
        data: { breadcrumb: 'Start task' },
        children: [
          {
            path: '',
            canDeactivate: [PendingRequestGuard],
            loadComponent: () => import('@accounts/containers').then((c) => c.ProcessActionsComponent),
          },
          {
            path: AVAILABLE_ACTIONS_MAP.SITE_VISIT.path,
            title: AVAILABLE_ACTIONS_MAP.SITE_VISIT.title,
            data: { breadcrumb: true },
            canDeactivate: [PendingRequestGuard],
            loadComponent: () => import('@accounts/containers/actions').then((c) => c.SiteVisitEntryPointComponent),
          },
        ],
      },
      {
        path: 'notes',
        loadChildren: () => import('@notes/notes.routes').then((r) => r.NOTES_ROUTES),
      },
      {
        path: 'workflows',
        loadChildren: () => import('@requests/workflows').then((r) => r.WORKFLOWS_ROUTES),
      },
      {
        path: 'file-download/:uuid',
        title: 'Download file',
        loadComponent: () => import('@notes/components').then((c) => c.NoteFileDownloadComponent),
      },
      {
        path: 'file-download/:fileType/:empId/:uuid',
        title: 'Download file',
        loadComponent: () => import('@shared/components').then((c) => c.FileDownloadComponent),
      },
    ],
  },
];
