import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import {
  getRequestTaskPageCanDeactivateGuard,
  getRequestTaskPageDefaultCanActivateGuard,
  REQUEST_TASK_PAGE_CONTENT,
} from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';

import { taskTitleResolver } from '@requests/common';
import {
  AER_AMEND_ROUTE_PREFIX,
  AER_ROUTE_PREFIX,
  AER_VERIFICATION_SUBMIT_ROUTE_PREFIX,
} from '@requests/common/aer/aer.consts';
import { EU_XML_IMPORT_ROUTE_PREFIX } from '@requests/common/eu-xml-import';
import {
  NON_COMPLIANCE_AMEND_DETAILS_ROUTE_PREFIX,
  NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEW_ROUTE_PREFIX,
  NON_COMPLIANCE_CIVIL_PENALTY_ROUTE_PREFIX,
  NON_COMPLIANCE_CLOSE_ROUTE_PREFIX,
  NON_COMPLIANCE_FINAL_DETERMINATION_ROUTE_PREFIX,
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEW_ROUTE_PREFIX,
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_ROUTE_PREFIX,
  NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEW_ROUTE_PREFIX,
  NON_COMPLIANCE_NOTICE_OF_INTENT_ROUTE_PREFIX,
  NON_COMPLIANCE_SUBMIT_ROUTE_PREFIX,
} from '@requests/common/non-compliance';
import { isPaymentCompleted, PAYMENT_ROUTE_PREFIX } from '@requests/common/payment';
import {
  canActivateProvideNoteRedirect,
  PROVIDE_NOTE_REDIRECT_ROUTE_PREFIX,
} from '@requests/common/provide-note-redirect';
import { taskProviders } from '@requests/common/task.providers';
import { AER_REVIEW_ROUTE_PREFIX } from '@requests/tasks/aer-review';
import { EMP_SUBMIT_ROUTE_PREFIX } from '@requests/tasks/emp-submit/emp-submit.const';
import { canActivatePendingPaymentProcess } from '@requests/tasks/payment/payment.guard';
import { SITE_VISIT_AMENDS_ROUTE_PREFIX } from '@requests/tasks/site-visit-amends';
import { SITE_VISIT_PEER_REVIEW_ROUTE_PREFIX } from '@requests/tasks/site-visit-peer-review';
import { SITE_VISIT_REVIEW_ROUTE_PREFIX } from '@requests/tasks/site-visit-review';
import { SITE_VISIT_ROUTE_PREFIX } from '@requests/tasks/site-visit-submit/site-visit-submit.constants';
import { tasksContent } from '@requests/tasks/tasks-content';
import { VIR_RESPOND_TO_REGULATOR_COMMENTS_PREFIX } from '@requests/tasks/vir-respond-to-regulator-comments';
import { VIR_REVIEW_PREFIX } from '@requests/tasks/vir-review';
import { VIR_SUBMIT_PREFIX } from '@requests/tasks/vir-submit';
import { taskActionTypeToTitleMap } from '@shared/constants';

export const TASKS_ROUTES: Routes = [
  {
    path: ':taskId',
    canActivate: [getRequestTaskPageDefaultCanActivateGuard()],
    canDeactivate: [getRequestTaskPageCanDeactivateGuard()],
    providers: taskProviders,
    data: { breadcrumb: ({ taskTitle }) => taskTitle },
    resolve: {
      taskTitle: taskTitleResolver,
    },
    children: [
      {
        path: '',
        canActivate: [canActivatePendingPaymentProcess],
        providers: [
          {
            provide: REQUEST_TASK_PAGE_CONTENT,
            useValue: tasksContent,
          },
        ],
        title: () => taskActionTypeToTitleMap?.[inject(RequestTaskStore).state.requestTaskItem.requestTask.type],
        loadChildren: () => import('@netz/common/request-task').then((r) => r.REQUEST_TASK_ROUTES),
      },
      {
        path: 'timeline',
        loadChildren: () => import('@requests/timeline').then((r) => r.TIMELINE_ROUTES),
      },
      {
        path: 'account-closure',
        loadChildren: () =>
          import('@requests/tasks/account-closure/account-closure.routes').then((r) => r.ACCOUNT_CLOSURE_ROUTES),
      },
      {
        path: EMP_SUBMIT_ROUTE_PREFIX,
        loadChildren: () => import('@requests/tasks/emp-submit/emp-submit.routes').then((r) => r.EMP_SUBMIT_ROUTES),
      },
      {
        path: 'emp-wait-for-review',
        loadChildren: () => import('@requests/tasks/emp-submit/emp-submit.routes').then((r) => r.EMP_SUBMIT_ROUTES),
      },
      {
        path: 'emp-amend',
        loadChildren: () => import('@requests/tasks/emp-amend').then((r) => r.EMP_AMEND_ROUTES),
      },
      {
        path: 'emp-wait-for-amend',
        loadChildren: () => import('@requests/tasks/emp-review').then((r) => r.EMP_REVIEW_ROUTES),
      },
      {
        path: 'emp-review',
        loadChildren: () => import('@requests/tasks/emp-review').then((r) => r.EMP_REVIEW_ROUTES),
      },
      {
        path: 'emp-peer-review',
        loadChildren: () => import('@requests/tasks/emp-peer-review').then((r) => r.EMP_PEER_REVIEW_ROUTES),
      },
      {
        path: 'emp-sent-to-peer-review',
        loadChildren: () => import('@requests/tasks/emp-peer-review').then((r) => r.EMP_PEER_REVIEW_ROUTES),
      },
      {
        path: 'emp-variation',
        loadChildren: () => import('@requests/tasks/emp-variation').then((r) => r.EMP_VARIATION_ROUTES),
      },
      {
        path: 'emp-variation-amend',
        loadChildren: () => import('@requests/tasks/emp-variation-amend').then((r) => r.EMP_VARIATION_AMEND_ROUTES),
      },
      {
        path: 'emp-variation-wait-for-review',
        loadChildren: () => import('@requests/tasks/emp-variation').then((r) => r.EMP_VARIATION_ROUTES),
      },
      {
        path: 'emp-variation-regulator',
        loadChildren: () =>
          import('@requests/tasks/emp-variation-regulator').then((r) => r.EMP_VARIATION_REGULATOR_ROUTES),
      },
      {
        path: 'emp-variation-review',
        loadChildren: () => import('@requests/tasks/emp-variation-review').then((r) => r.EMP_VARIATION_REVIEW_ROUTES),
      },
      {
        path: 'emp-variation-wait-for-amend',
        loadChildren: () => import('@requests/tasks/emp-variation-review').then((r) => r.EMP_VARIATION_REVIEW_ROUTES),
      },
      {
        path: 'emp-variation-peer-review',
        loadChildren: () =>
          import('@requests/tasks/emp-variation-peer-review').then((r) => r.EMP_VARIATION_PEER_REVIEW_ROUTES),
      },
      {
        path: 'emp-variation-regulator-peer-review',
        loadChildren: () =>
          import('@requests/tasks/emp-variation-regulator-peer-review').then(
            (r) => r.EMP_VARIATION_REGULATOR_PEER_REVIEW_ROUTES,
          ),
      },
      {
        path: 'emp-variation-sent-to-peer-review',
        loadChildren: () => import('@requests/tasks/emp-variation-review').then((r) => r.EMP_VARIATION_REVIEW_ROUTES),
      },
      {
        path: 'emp-variation-regulator-wait-for-peer-review',
        loadChildren: () =>
          import('@requests/tasks/emp-variation-regulator-peer-review').then(
            (r) => r.EMP_VARIATION_REGULATOR_PEER_REVIEW_ROUTES,
          ),
      },
      {
        path: 'notification',
        loadChildren: () =>
          import('@requests/tasks/notification-submit/notification.routes').then((r) => r.NOTIFICATION_ROUTES),
      },
      {
        path: 'review',
        loadChildren: () => import('@requests/tasks/notification-review/review.routes').then((r) => r.REVIEW_ROUTES),
      },
      {
        path: 'peer-review',
        loadChildren: () =>
          import('@requests/tasks/notification-peer-review/peer-review.routes').then((r) => r.PEER_REVIEW_ROUTES),
      },
      {
        path: 'follow-up',
        loadChildren: () =>
          import('@requests/tasks/notification-follow-up/follow-up.routes').then((r) => r.FOLLOW_UP_ROUTES),
      },
      {
        path: 'follow-up-review',
        loadChildren: () =>
          import('@requests/tasks/notification-follow-up-review/follow-up-review.routes').then(
            (r) => r.FOLLOW_UP_REVIEW_ROUTES,
          ),
      },
      {
        path: 'follow-up-amend',
        loadChildren: () =>
          import('@requests/tasks/notification-follow-up-amend/follow-up-amend.routes').then(
            (r) => r.FOLLOW_UP_AMEND_ROUTES,
          ),
      },
      {
        path: 'wait-for-amends',
        loadChildren: () =>
          import('@requests/tasks/notification-wait-for-amends/wait-for-amends.routes').then(
            (r) => r.WAIT_FOR_AMENDS_ROUTES,
          ),
      },
      {
        path: 'wait-for-follow-up',
        loadChildren: () =>
          import('@requests/tasks/notification-wait-for-follow-up/wait-for-follow-up.routes').then(
            (r) => r.WAIT_FOR_FOLLOW_UP_ROUTES,
          ),
      },
      {
        path: 'wait-for-peer-review',
        loadChildren: () =>
          import('@requests/tasks/notification-wait-for-peer-review/wait-for-peer-review.routes').then(
            (r) => r.WAIT_FOR_PEER_REVIEW_ROUTES,
          ),
      },
      {
        path: 'file-download',
        loadChildren: () =>
          import('@shared/components/file-download/file-download.routes').then((c) => c.FILE_DOWNLOAD_ROUTES),
      },
      {
        path: 'recall',
        loadChildren: () => import('@requests/common/components/recall').then((r) => r.RECALL_ROUTES),
      },
      {
        path: PROVIDE_NOTE_REDIRECT_ROUTE_PREFIX,
        canActivate: [canActivateProvideNoteRedirect],
        children: [],
      },
      {
        path: 'rde',
        canActivate: [isPaymentCompleted],
        loadChildren: () =>
          import('@requests/common/emp/request-deadline-extension').then((r) => r.REQUEST_DEADLINE_EXTENSION_ROUTES),
      },
      {
        path: 'rfi',
        canActivate: [isPaymentCompleted],
        loadChildren: () =>
          import('@requests/common/emp/request-for-information').then((r) => r.REQUEST_FOR_INFORMATION_ROUTES),
      },
      {
        path: 'registry',
        loadChildren: () =>
          import('@requests/common/emp/registry-integration').then((r) => r.REGISTRY_INTEGRATION_ROUTES),
      },
      {
        path: AER_ROUTE_PREFIX,
        loadChildren: () => import('@requests/tasks/aer-submit/aer-submit.routes').then((r) => r.AER_SUBMIT_ROUTES),
      },
      {
        path: AER_AMEND_ROUTE_PREFIX,
        loadChildren: () => import('@requests/tasks/aer-amend/aer-amend.routes').then((r) => r.AER_AMEND_ROUTES),
      },
      {
        path: AER_VERIFICATION_SUBMIT_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/tasks/aer-verification-submit/aer-verification-submit.routes').then(
            (r) => r.AER_VERIFICATION_SUBMIT_ROUTES,
          ),
      },
      {
        path: 'doe-submit',
        loadChildren: () => import('@requests/tasks/doe-submit/doe-submit.routes').then((r) => r.DOE_SUBMIT_ROUTES),
      },
      {
        path: 'doe-peer-review',
        loadChildren: () => import('@requests/tasks/doe-peer-review').then((r) => r.DOE_PEER_REVIEW_ROUTES),
      },
      {
        path: VIR_SUBMIT_PREFIX,
        loadChildren: () => import('@requests/tasks/vir-submit').then((r) => r.VIR_SUBMIT_ROUTES),
      },
      {
        path: VIR_REVIEW_PREFIX,
        loadChildren: () => import('@requests/tasks/vir-review').then((r) => r.VIR_REVIEW_ROUTES),
      },
      {
        path: VIR_RESPOND_TO_REGULATOR_COMMENTS_PREFIX,
        loadChildren: () =>
          import('@requests/tasks/vir-respond-to-regulator-comments').then(
            (r) => r.VIR_RESPOND_TO_REGULATOR_COMMENTS_ROUTES,
          ),
      },
      {
        path: PAYMENT_ROUTE_PREFIX,
        loadChildren: () => import('@requests/tasks/payment').then((r) => r.PAYMENT_ROUTES),
      },
      {
        path: AER_REVIEW_ROUTE_PREFIX,
        loadChildren: () => import('@requests/tasks/aer-review').then((r) => r.AER_REVIEW_ROUTES),
      },
      {
        path: NON_COMPLIANCE_SUBMIT_ROUTE_PREFIX,
        loadChildren: () => import('@requests/tasks/non-compliance-submit').then((r) => r.NON_COMPLIANCE_SUBMIT_ROUTES),
      },
      {
        path: NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/tasks/non-compliance-initial-penalty-notice').then(
            (r) => r.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_ROUTES,
          ),
      },
      {
        path: NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEW_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/tasks/non-compliance-initial-penalty-notice-peer-review').then(
            (r) => r.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEW_ROUTES,
          ),
      },
      {
        path: NON_COMPLIANCE_NOTICE_OF_INTENT_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/tasks/non-compliance-notice-of-intent').then(
            (r) => r.NON_COMPLIANCE_NOTICE_OF_INTENT_ROUTES,
          ),
      },
      {
        path: NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEW_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/tasks/non-compliance-notice-of-intent-peer-review').then(
            (r) => r.NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEW_ROUTES,
          ),
      },
      {
        path: NON_COMPLIANCE_CIVIL_PENALTY_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/tasks/non-compliance-civil-penalty').then((r) => r.NON_COMPLIANCE_CIVIL_PENALTY_ROUTES),
      },
      {
        path: NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEW_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/tasks/non-compliance-civil-penalty-peer-review').then(
            (r) => r.NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEW_ROUTES,
          ),
      },
      {
        path: NON_COMPLIANCE_FINAL_DETERMINATION_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/tasks/non-compliance-final-determination').then(
            (r) => r.NON_COMPLIANCE_FINAL_DETERMINATION_ROUTES,
          ),
      },
      {
        path: NON_COMPLIANCE_CLOSE_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/common/non-compliance/non-compliance-close').then((r) => r.NON_COMPLIANCE_CLOSE_ROUTES),
      },
      {
        path: NON_COMPLIANCE_AMEND_DETAILS_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/common/non-compliance/non-compliance-amend-details').then(
            (r) => r.NON_COMPLIANCE_AMEND_DETAILS_ROUTES,
          ),
      },
      {
        path: SITE_VISIT_ROUTE_PREFIX,
        loadChildren: () => import('@requests/tasks/site-visit-submit').then((r) => r.SITE_VISIT_SUBMIT_ROUTES),
      },
      {
        path: SITE_VISIT_REVIEW_ROUTE_PREFIX,
        loadChildren: () => import('@requests/tasks/site-visit-review').then((r) => r.SITE_VISIT_REVIEW_ROUTES),
      },
      {
        path: SITE_VISIT_PEER_REVIEW_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/tasks/site-visit-peer-review').then((r) => r.SITE_VISIT_PEER_REVIEW_ROUTES),
      },
      {
        path: SITE_VISIT_AMENDS_ROUTE_PREFIX,
        loadChildren: () => import('@requests/tasks/site-visit-amends').then((r) => r.SITE_VISIT_AMENDS_ROUTES),
      },
      {
        path: EU_XML_IMPORT_ROUTE_PREFIX,
        loadChildren: () =>
          import('@requests/common/eu-xml-import/eu-xml-import.routes').then((r) => r.EU_XML_IMPORT_ROUTES),
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/dashboard',
  },
];
