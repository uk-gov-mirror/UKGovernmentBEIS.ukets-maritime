import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { PAYLOAD_MUTATORS, SIDE_EFFECTS, TaskApiService, TaskService, WIZARD_FLOW_MANAGERS } from '@netz/common/forms';

import { SiteVisitApiService, SiteVisitService } from '@requests/common/site-visit/services';
import { ApplicationDetailsFlowManager } from '@requests/common/site-visit/subtasks/application-details';
import { ApplicationDetailsEvidencePayloadMutator } from '@requests/common/site-visit/subtasks/application-details/application-details-evidence';
import { ApplicationDetailsSummarySideEffect } from '@requests/common/site-visit/subtasks/application-details/application-details-summary';

export const provideTaskPayloadMutators = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: PAYLOAD_MUTATORS, multi: true, useClass: ApplicationDetailsEvidencePayloadMutator },
  ]);

export const provideTaskSideEffects = (): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: SIDE_EFFECTS, multi: true, useClass: ApplicationDetailsSummarySideEffect }]);

export const provideTaskServices = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: TaskService, useClass: SiteVisitService },
    { provide: TaskApiService, useClass: SiteVisitApiService },
  ]);

export const provideWizardFlowManagers = (): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: WIZARD_FLOW_MANAGERS, multi: true, useClass: ApplicationDetailsFlowManager }]);
