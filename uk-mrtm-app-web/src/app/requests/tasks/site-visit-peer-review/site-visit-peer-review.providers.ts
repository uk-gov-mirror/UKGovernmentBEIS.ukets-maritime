import { EnvironmentProviders, makeEnvironmentProviders, Provider } from '@angular/core';

import { PAYLOAD_MUTATORS, TaskApiService, TaskService, WIZARD_FLOW_MANAGERS } from '@netz/common/forms';

import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import {
  PEER_REVIEW_DECISION_SELECTOR,
  PEER_REVIEW_DECISION_STATUS_SELECTOR,
  PeerReviewDecisionFlowManager,
} from '@requests/common/subtasks/peer-review-decision';
import { PEER_REVIEW_DECISION_SUB_TASK } from '@requests/common/subtasks/peer-review-decision/peer-review-decision.helper';
import { PeerReviewDecisionPayloadMutator } from '@requests/tasks/site-visit-peer-review/payload-mutators';
import {
  SiteVisitPeerReviewApiService,
  SiteVisitPeerReviewService,
} from '@requests/tasks/site-visit-peer-review/services';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';

export const provideTaskPayloadMutators = (): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: PAYLOAD_MUTATORS, multi: true, useClass: PeerReviewDecisionPayloadMutator }]);

export const provideTaskServices = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: TaskService, useClass: SiteVisitPeerReviewService },
    { provide: TaskApiService, useClass: SiteVisitPeerReviewApiService },
  ]);

export const provideWizardFlowManagers = (): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: WIZARD_FLOW_MANAGERS, multi: true, useClass: PeerReviewDecisionFlowManager }]);

export const peerReviewDecisionProviders: Provider[] = [
  { provide: PEER_REVIEW_DECISION_SELECTOR, useValue: siteVisitReviewQuery.selectPeerReviewDecision },
  {
    provide: PEER_REVIEW_DECISION_STATUS_SELECTOR,
    useValue: siteVisitCommonQuery.selectStatusForSubtask(PEER_REVIEW_DECISION_SUB_TASK),
  },
];
