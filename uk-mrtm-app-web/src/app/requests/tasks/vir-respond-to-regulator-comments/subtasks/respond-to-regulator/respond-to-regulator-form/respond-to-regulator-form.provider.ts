import { Provider } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { RequestTaskStore } from '@netz/common/store';
import { GovukValidators } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { virRespondToRegulatorCommentsQuery } from '@requests/tasks/vir-respond-to-regulator-comments/+state';
import {
  RespondToRegulatorFormGroupModel,
  RespondToRegulatorFormModel,
} from '@requests/tasks/vir-respond-to-regulator-comments/subtasks/respond-to-regulator/respond-to-regulator-form/respond-to-regulator-form.types';
import { isNil } from '@shared/utils';
import { todayOrPastDateValidator } from '@shared/validators';

export const respondToRegulatorFormProvider: Provider = {
  provide: TASK_FORM,
  deps: [FormBuilder, RequestTaskStore, ActivatedRoute],
  useFactory: (
    formBuilder: FormBuilder,
    store: RequestTaskStore,
    activatedRoute: ActivatedRoute,
  ): FormGroup<RespondToRegulatorFormGroupModel> => {
    const key = activatedRoute.snapshot.params?.['key'];
    const operatorResponse = store.select(
      virRespondToRegulatorCommentsQuery.selectOperatorImprovementResponseData(key),
    )();

    return formBuilder.group({
      key: formBuilder.control<RespondToRegulatorFormModel['key'] | null>(key),
      improvementCompleted: formBuilder.control<RespondToRegulatorFormModel['improvementCompleted'] | null>(
        operatorResponse?.improvementCompleted ?? null,
        {
          validators: GovukValidators.required('Select yes if the required improvement is complete'),
        },
      ),
      dateCompleted: formBuilder.control<Date | null>(
        !isNil(operatorResponse?.dateCompleted) ? new Date(operatorResponse.dateCompleted) : null,
        {
          validators: [
            GovukValidators.required('Enter a date'),
            todayOrPastDateValidator('The date of the improvement'),
          ],
        },
      ),
      reason: formBuilder.control<RespondToRegulatorFormModel['reason'] | null>(operatorResponse?.reason ?? null, {
        validators: [
          GovukValidators.required('State why you have not addressed the recommendation'),
          GovukValidators.maxLength(10000, 'Enter up to 10000 characters'),
        ],
      }),
    });
  },
};
