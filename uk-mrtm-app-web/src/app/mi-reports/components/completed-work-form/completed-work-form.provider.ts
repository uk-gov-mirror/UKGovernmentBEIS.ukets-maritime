import { Provider } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { isBefore } from 'date-fns';

import { DateInputValidators, GovukValidators } from '@netz/govuk-components';

import { CompleteWorkFormGroupModel } from '@mi-reports/components/completed-work-form/completed-work-form.types';
import { MI_REPORT_FORM_GROUP } from '@mi-reports/core/mi-report.providers';
import { isNil } from '@shared/utils';
import { todayOrPastDateValidator } from '@shared/validators';

const datePeriodValidator: ValidatorFn = (group: FormGroup<CompleteWorkFormGroupModel>): ValidationErrors => {
  const fromDateCtrl = group.get('fromDate');
  const toDateCtrl = group.get('toDate');

  if (!fromDateCtrl.valid || !toDateCtrl.valid || isNil(toDateCtrl.valid)) {
    return null;
  }

  if (isBefore(toDateCtrl.value, fromDateCtrl.value)) {
    return {
      invalidDates: 'Date from must be before date to',
    };
  }

  return null;
};

export const completedWorkFormProvider: Provider = {
  provide: MI_REPORT_FORM_GROUP,
  deps: [FormBuilder],
  useFactory: (formBuilder: FormBuilder): (() => FormGroup<CompleteWorkFormGroupModel>) => {
    return () =>
      formBuilder.group(
        {
          option: [null, [GovukValidators.required('Select an option')]],
          year: [
            null,
            [
              GovukValidators.required('Enter a year value'),
              GovukValidators.builder(
                `Enter a valid year value e.g. 2022`,
                DateInputValidators.dateFieldValidator('year', 1900, 2100),
              ),
            ],
          ],
          fromDate: [null, [GovukValidators.required('Enter a date value'), todayOrPastDateValidator('The date from')]],
          toDate: [null],
        },
        {
          validators: [datePeriodValidator],
        },
      );
  },
};
