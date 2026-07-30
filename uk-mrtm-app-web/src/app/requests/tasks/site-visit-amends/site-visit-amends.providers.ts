import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { PAYLOAD_MUTATORS, SIDE_EFFECTS, TaskApiService, TaskService, WIZARD_FLOW_MANAGERS } from '@netz/common/forms';

import { ApplicationDetailsFlowManager } from '@requests/common/site-visit/subtasks/application-details';
import { ApplicationDetailsEvidencePayloadMutator } from '@requests/common/site-visit/subtasks/application-details/application-details-evidence';
import { ApplicationDetailsSummarySideEffect } from '@requests/common/site-visit/subtasks/application-details/application-details-summary';
import { SiteVisitAmendsApiService, SiteVisitAmendsService } from '@requests/tasks/site-visit-amends/services';
import {
  SiteVisitRequestedChangesFlowManager,
  SiteVisitRequestedChangesQuestionPayloadMutator,
} from '@requests/tasks/site-visit-amends/subtasks/requested-changes';

export const provideTaskPayloadMutators = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: PAYLOAD_MUTATORS, multi: true, useClass: ApplicationDetailsEvidencePayloadMutator },
    { provide: PAYLOAD_MUTATORS, multi: true, useClass: SiteVisitRequestedChangesQuestionPayloadMutator },
  ]);

export const provideTaskSideEffects = (): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: SIDE_EFFECTS, multi: true, useClass: ApplicationDetailsSummarySideEffect }]);

export const provideTaskServices = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: TaskService, useClass: SiteVisitAmendsService },
    { provide: TaskApiService, useClass: SiteVisitAmendsApiService },
  ]);

export const provideWizardFlowManagers = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: WIZARD_FLOW_MANAGERS, multi: true, useClass: ApplicationDetailsFlowManager },
    { provide: WIZARD_FLOW_MANAGERS, multi: true, useClass: SiteVisitRequestedChangesFlowManager },
  ]);
