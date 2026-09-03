import { Provider } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { RequestTaskStore } from '@netz/common/store';
import { GovukValidators } from '@netz/govuk-components';

import { nonComplianceCommonQuery } from '@requests/common/non-compliance/+state/non-compliance-common.selectors';
import { NonComplianceDetailsBase } from '@requests/common/non-compliance/non-compliance.types';
import { TASK_FORM } from '@requests/common/task-form.token';
import { todayOrPastDateValidator } from '@shared/validators';

export const nonComplianceDetailsBaseProvider: Provider = {
  provide: TASK_FORM,
  deps: [FormBuilder, RequestTaskStore],
  useFactory: (formBuilder: FormBuilder, store: RequestTaskStore) => {
    const nonComplianceDetails = store.select(nonComplianceCommonQuery.selectNonComplianceDetailsBase)();

    return formBuilder.group({
      reason: formBuilder.control<NonComplianceDetailsBase['reason'] | null>(nonComplianceDetails?.reason, {
        validators: [GovukValidators.required('You must select a type')],
      }),
      complianceDate: formBuilder.control<NonComplianceDetailsBase['complianceDate'] | Date | null>(
        nonComplianceDetails?.complianceDate ? new Date(nonComplianceDetails?.complianceDate) : null,
        { validators: [todayOrPastDateValidator()] },
      ),
      nonComplianceDate: formBuilder.control<NonComplianceDetailsBase['nonComplianceDate'] | Date | null>(
        nonComplianceDetails?.nonComplianceDate ? new Date(nonComplianceDetails?.nonComplianceDate) : null,
        { validators: [todayOrPastDateValidator()] },
      ),
      nonComplianceComments: formBuilder.control<NonComplianceDetailsBase['nonComplianceComments']>(
        nonComplianceDetails?.nonComplianceComments ?? null,
        [GovukValidators.maxLength(10000, 'Enter up to 10000 characters')],
      ),
    });
  },
};
