import { Routes } from '@angular/router';

import { PendingRequestGuard } from '@core/guards/pending-request.guard';
import { DocumentTemplateGuard } from '@templates/document/document-template.guard';
import { EmailTemplateGuard } from '@templates/email/email-template.guard';

export const TEMPLATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@templates/templates.component').then((c) => c.TemplatesComponent),
  },
  {
    path: 'email/:templateId',
    children: [
      {
        path: '',
        title: 'Email template',
        canActivate: [EmailTemplateGuard],
        resolve: { emailTemplate: EmailTemplateGuard },
        loadComponent: () =>
          import('@templates/email/email-template-overview.component').then((c) => c.EmailTemplateOverviewComponent),
      },
      {
        path: 'edit',
        title: 'Edit email template',
        canActivate: [EmailTemplateGuard],
        canDeactivate: [PendingRequestGuard],
        resolve: { emailTemplate: EmailTemplateGuard },
        loadComponent: () =>
          import('@templates/email/edit/email-template.component').then((c) => c.EmailTemplateComponent),
      },
    ],
  },
  {
    path: 'document/:templateId',
    children: [
      {
        path: '',
        title: 'Document template',
        canActivate: [DocumentTemplateGuard],
        resolve: { documentTemplate: DocumentTemplateGuard },
        loadComponent: () =>
          import('@templates/document/document-template-overview.component').then(
            (c) => c.DocumentTemplateOverviewComponent,
          ),
      },
      {
        path: 'edit',
        title: 'Edit document template',
        canActivate: [DocumentTemplateGuard],
        canDeactivate: [PendingRequestGuard],
        resolve: { documentTemplate: DocumentTemplateGuard },
        loadComponent: () =>
          import('@templates/document/edit/document-template.component').then((c) => c.DocumentTemplateComponent),
      },
      {
        path: 'file-download/:uuid',
        loadComponent: () =>
          import('@templates/file-download/template-file-download.component').then(
            (c) => c.TemplateFileDownloadComponent,
          ),
      },
    ],
  },
];
