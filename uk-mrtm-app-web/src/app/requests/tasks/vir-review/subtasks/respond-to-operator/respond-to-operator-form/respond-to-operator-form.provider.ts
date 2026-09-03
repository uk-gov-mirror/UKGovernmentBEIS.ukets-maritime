import { Provider } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { isAfter } from 'date-fns';

import { RequestTaskStore } from '@netz/common/store';
import { GovukValidators } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { virReviewQuery } from '@requests/tasks/vir-review/+state';
import {
  RespondToOperatorFormGroupModel,
  RespondToOperatorFormModel,
} from '@requests/tasks/vir-review/subtasks/respond-to-operator/respond-to-operator-form/respond-to-operator-form.types';
import { earliestTodayAnywhere, isNil, toUtcStartOfDay } from '@shared/utils';

const futureDateValidator: ValidatorFn = (control: AbstractControl) => {
  const inputDay = toUtcStartOfDay(control.value);

  return isNil(inputDay) || isAfter(inputDay, earliestTodayAnywhere())
    ? null
    : { futureDateError: 'The date of the improvement must be in the future' };
};

export const respondToOperatorFormProvider: Provider = {
  provide: TASK_FORM,
  deps: [FormBuilder, RequestTaskStore, ActivatedRoute],
  useFactory: (
    formBuilder: FormBuilder,
    store: RequestTaskStore,
    activatedRoute: ActivatedRoute,
  ): FormGroup<RespondToOperatorFormGroupModel> => {
    const key = activatedRoute.snapshot.params?.['key'];
    const regulatorResponse = store.select(virReviewQuery.selectRegulatorResponseData(key))();

    return formBuilder.group({
      key: formBuilder.control<string>(key),
      improvementRequired: formBuilder.control<RespondToOperatorFormModel['improvementRequired'] | null>(
        regulatorResponse?.improvementRequired,
        {
          validators: GovukValidators.required('Select yes if improvement required'),
        },
      ),
      improvementDeadline: formBuilder.control<Date | null>(
        !isNil(regulatorResponse?.improvementDeadline) ? new Date(regulatorResponse?.improvementDeadline) : null,
        {
          validators: [GovukValidators.required('Enter a date'), futureDateValidator],
        },
      ),
      improvementComments: formBuilder.control<RespondToOperatorFormModel['improvementComments'] | null>(
        regulatorResponse?.improvementComments,
        {
          validators: GovukValidators.maxLength(10000, 'Enter up to 10000 characters'),
        },
      ),
      operatorActions: formBuilder.control<RespondToOperatorFormModel['operatorActions'] | null>(
        regulatorResponse?.operatorActions,
        {
          validators: [
            GovukValidators.required('Enter your actions for the operator'),
            GovukValidators.maxLength(10000, 'Enter up to 10000 characters'),
          ],
        },
      ),
    });
  },
};
