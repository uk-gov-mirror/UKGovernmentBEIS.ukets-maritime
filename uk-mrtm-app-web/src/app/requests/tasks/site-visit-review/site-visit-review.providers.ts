import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { PAYLOAD_MUTATORS, SIDE_EFFECTS, TaskApiService, TaskService, WIZARD_FLOW_MANAGERS } from '@netz/common/forms';

import { ApplicationDetailsFlowManager } from '@requests/common/site-visit/subtasks/application-details';
import { SiteVisitReviewApiService, SiteVisitReviewService } from '@requests/tasks/site-visit-review/services';
import { ApplicationDetailsDecisionPayloadMutator } from '@requests/tasks/site-visit-review/subtasks/application-details/application-details-decision/application-details-decision.payload-mutator';
import { ApplicationDetailsDecisionSummarySideEffect } from '@requests/tasks/site-visit-review/subtasks/application-details/application-details-decision-summary/application-details-decision-summary.side-effect';

export const provideTaskPayloadMutators = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: PAYLOAD_MUTATORS, multi: true, useClass: ApplicationDetailsDecisionPayloadMutator },
  ]);

export const provideTaskSideEffects = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: SIDE_EFFECTS, multi: true, useClass: ApplicationDetailsDecisionSummarySideEffect },
  ]);

export const provideTaskServices = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: TaskService, useClass: SiteVisitReviewService },
    { provide: TaskApiService, useClass: SiteVisitReviewApiService },
  ]);

export const provideWizardFlowManagers = (): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: WIZARD_FLOW_MANAGERS, multi: true, useClass: ApplicationDetailsFlowManager }]);
