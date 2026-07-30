import { Provider } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { RequestTaskStore } from '@netz/common/store';
import { GovukValidators } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { createAnotherRequiredChange } from '@requests/tasks/emp-review/components';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';
import { RequestTaskFileService } from '@shared/services';

export const applicationDetailsDecisionFormProvider: Provider = {
  provide: TASK_FORM,
  deps: [FormBuilder, RequestTaskStore, RequestTaskFileService],
  useFactory: (fb: FormBuilder, store: RequestTaskStore, requestTaskFileService: RequestTaskFileService) => {
    const reviewDecision = store.select(siteVisitReviewQuery.selectReviewDecision)();
    const reviewAttachments = store.select(siteVisitReviewQuery.selectReviewAttachments)();

    return fb.group({
      type: fb.control(reviewDecision?.type ?? null, {
        validators: [GovukValidators.required('Select a decision')],
        updateOn: 'change',
      }),
      notes: fb.control(reviewDecision?.details?.notes ?? null, [
        GovukValidators.maxLength(10000, 'Enter up to 10000 characters'),
      ]),
      summary: fb.control((reviewDecision?.details as any)?.summary ?? null, [
        GovukValidators.maxLength(10000, 'Enter up to 10000 characters'),
        GovukValidators.required('Enter a summary'),
      ]),
      requiredChanges: fb.array(
        (reviewDecision?.details as any)?.requiredChanges?.map((requiredChange) =>
          createAnotherRequiredChange(store, requestTaskFileService, requiredChange, reviewAttachments),
        ) ?? [createAnotherRequiredChange(store, requestTaskFileService)],
      ),
    });
  },
};
