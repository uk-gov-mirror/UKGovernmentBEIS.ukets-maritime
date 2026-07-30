import { inject } from '@angular/core';

import { FeedbackBannerComponent } from '@netz/common/components';
import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { ThirdPartyDataProviderInfoComponent } from '@requests/common/third-party-data-provider';
import { AerVerificationSubmitComponent } from '@requests/tasks/aer-verification-submit/components';
import { taskActionTypeToTitleTransformer } from '@shared/utils';

export const aerVerificationSubmitTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
  const year = store.select(aerCommonQuery.selectReportingYear)();
  const allowedRequestTaskActions = store.select(requestTaskQuery.selectAllowedRequestTaskActions)();

  return {
    pageTopComponent: FeedbackBannerComponent,
    header: taskActionTypeToTitleTransformer(requestTaskType, year),
    headerSize: 'xl',
    preContentComponent: allowedRequestTaskActions.includes('AER_VERIFICATION_IMPORT_THIRD_PARTY_DATA_APPLICATION')
      ? [ThirdPartyDataProviderInfoComponent]
      : null,
    contentComponent: AerVerificationSubmitComponent,
  };
};
