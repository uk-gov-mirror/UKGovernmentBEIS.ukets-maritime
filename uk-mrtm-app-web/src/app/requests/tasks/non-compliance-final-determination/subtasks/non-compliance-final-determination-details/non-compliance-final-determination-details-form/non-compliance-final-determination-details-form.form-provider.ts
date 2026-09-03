import { Provider } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { NonComplianceFinalDetermination } from '@mrtm/api';

import { RequestTaskStore } from '@netz/common/store';
import { GovukValidators } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common/task-form.token';
import { nonComplianceFinalDeterminationQuery } from '@requests/tasks/non-compliance-final-determination/+state';
import { todayOrPastDateValidator } from '@shared/validators';

export const nonComplianceFinalDeterminationDetailsFormProvider: Provider = {
  provide: TASK_FORM,
  deps: [FormBuilder, RequestTaskStore],
  useFactory: (formBuilder: FormBuilder, store: RequestTaskStore) => {
    const nonComplianceFinalDetermination = store.select(
      nonComplianceFinalDeterminationQuery.selectNonComplianceFinalDetermination,
    )();

    return formBuilder.group({
      complianceRestored: formBuilder.control<NonComplianceFinalDetermination['complianceRestored'] | null>(
        nonComplianceFinalDetermination?.complianceRestored,
        [GovukValidators.required('Select yes if compliance has been restored')],
      ),
      complianceRestoredDate: formBuilder.control<
        NonComplianceFinalDetermination['complianceRestoredDate'] | Date | null
      >(
        {
          value: nonComplianceFinalDetermination?.complianceRestoredDate
            ? new Date(nonComplianceFinalDetermination?.complianceRestoredDate)
            : null,
          disabled: nonComplianceFinalDetermination?.complianceRestored !== 'YES',
        },
        [GovukValidators.required('Enter when did the operator become compliant'), todayOrPastDateValidator()],
      ),
      comments: formBuilder.control<NonComplianceFinalDetermination['comments']>(
        nonComplianceFinalDetermination?.comments ?? null,
        [
          GovukValidators.required('Enter your comments on the status of compliance'),
          GovukValidators.maxLength(10000, 'Enter up to 10000 characters'),
        ],
      ),
      reissuePenalty: formBuilder.control<NonComplianceFinalDetermination['reissuePenalty'] | null>(
        nonComplianceFinalDetermination?.reissuePenalty,
        [GovukValidators.required('Select yes if you need to withdraw and reissue this penalty notice')],
      ),
      operatorPaid: formBuilder.control<NonComplianceFinalDetermination['operatorPaid'] | null>(
        nonComplianceFinalDetermination?.operatorPaid,
        [GovukValidators.required('Select yes if the operator has paid this penalty')],
      ),
      operatorPaidDate: formBuilder.control<NonComplianceFinalDetermination['operatorPaidDate'] | Date | null>(
        {
          value: nonComplianceFinalDetermination?.operatorPaidDate
            ? new Date(nonComplianceFinalDetermination?.operatorPaidDate)
            : null,
          disabled: nonComplianceFinalDetermination?.operatorPaid !== true,
        },
        [GovukValidators.required('Enter when did the operator pay'), todayOrPastDateValidator()],
      ),
    });
  },
};
