import { inject } from '@angular/core';

import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import { WaitRegulatorDeterminationComponent } from '@shared/components/wait-regulator-determination/wait-regulator-determination.component';
import { taskActionTypeToTitleTransformer } from '@shared/utils';

export const siteVisitWaitForReviewTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
  const year = store.select(siteVisitCommonQuery.selectYear)();

  return {
    header: taskActionTypeToTitleTransformer(requestTaskType, year),
    preContentComponent: WaitRegulatorDeterminationComponent,
    sections: [],
  };
};
