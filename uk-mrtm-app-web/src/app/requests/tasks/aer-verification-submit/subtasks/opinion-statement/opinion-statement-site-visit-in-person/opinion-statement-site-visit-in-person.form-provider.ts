import { Provider } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn } from '@angular/forms';

import { addDays, isAfter } from 'date-fns';

import { AerInPersonSiteVisit, AerInPersonSiteVisitDates } from '@mrtm/api';

import { RequestTaskStore } from '@netz/common/store';
import { GovukValidators } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common/task-form.token';
import { aerVerificationSubmitQuery } from '@requests/tasks/aer-verification-submit/+state/aer-verification-submit.selectors';
import {
  AerInPersonSiteVisitDatesFormGroupModel,
  AerInPersonSiteVisitFormGroupModel,
} from '@requests/tasks/aer-verification-submit/subtasks/opinion-statement/opinion-statement-site-visit-in-person/opinion-statement-site-visit-in-person.types';
import { isNil, latestTodayAnywhere, toUtcStartOfDay } from '@shared/utils';
import { todayOrPastDateValidator } from '@shared/validators';

export const addVisitDateFormGroup = (
  data?: AerInPersonSiteVisitDates,
): FormGroup<AerInPersonSiteVisitDatesFormGroupModel> =>
  new FormGroup<AerInPersonSiteVisitDatesFormGroupModel>(
    {
      startDate: new FormControl<Date>(!isNil(data?.startDate) ? new Date(data?.startDate) : null, [
        GovukValidators.required('Enter the date when the site visit began'),
        todayOrPastDateValidator(),
      ]),
      numberOfDays: new FormControl<number>(data?.numberOfDays, [
        GovukValidators.required('Enter the number of days your team were on site'),
        GovukValidators.naturalNumber('Must be integer greater than 0'),
        GovukValidators.max(365, 'Must be less than 365 days'),
      ]),
    },
    { validators: [siteVisitRangeTodayOrInThePast(), duplicatedDateValidator()], updateOn: 'change' },
  );

export const opinionStatementSiteVisitInPersonFormProvider: Provider = {
  provide: TASK_FORM,
  deps: [FormBuilder, RequestTaskStore],
  useFactory: (formBuilder: FormBuilder, store: RequestTaskStore) => {
    const opinionStatement = store.select(aerVerificationSubmitQuery.selectOpinionStatement)();
    const siteVisit = opinionStatement?.siteVisit as AerInPersonSiteVisit;
    const visitDates = siteVisit?.visitDates?.length ? siteVisit?.visitDates : [undefined];

    return formBuilder.group<AerInPersonSiteVisitFormGroupModel>({
      visitDates: formBuilder.array(visitDates.map((visitDate) => addVisitDateFormGroup(visitDate))),
      teamMembers: formBuilder.control<AerInPersonSiteVisit['teamMembers']>(siteVisit?.teamMembers, {
        validators: [
          GovukValidators.required('Enter the name of team member that made the site visit'),
          GovukValidators.maxLength(10000, 'Enter up to 10000 characters'),
        ],
      }),
    });
  },
};

function siteVisitRangeTodayOrInThePast(): ValidatorFn {
  return (formGroup: FormGroup<AerInPersonSiteVisitDatesFormGroupModel>): { [key: string]: string } | null => {
    if (formGroup.get('startDate').invalid || formGroup.get('numberOfDays').invalid) {
      return null;
    }

    const dates = getDates(formGroup);
    const latestToday = latestTodayAnywhere();
    if (dates.length && dates.some((date) => isAfter(toUtcStartOfDay(date), latestToday))) {
      return { invalidDate: 'The days must be in accordance with when the site visit began' };
    }
    return null;
  };
}

function duplicatedDateValidator(): ValidatorFn {
  return (visitDateFormGroup: FormGroup<AerInPersonSiteVisitDatesFormGroupModel>): { [key: string]: string } | null => {
    const formArray = visitDateFormGroup.parent as AerInPersonSiteVisitFormGroupModel['visitDates'];
    if (formArray) {
      const visitDatesValues: string[] = formArray.controls.reduce(
        (acc, visitDate) => [...acc, ...getDates(visitDate).map((date) => date.toISOString())],
        [],
      );
      const duplicatedDates = visitDatesValues.filter((date, index) => visitDatesValues.indexOf(date) !== index);

      if (duplicatedDates.length) {
        const formGroupDates = getDates(visitDateFormGroup).map((date) => date.toISOString());
        const formGroupIncludesDuplicatedDate = formGroupDates.some((date) => duplicatedDates.includes(date));

        return formGroupIncludesDuplicatedDate
          ? { duplicatedDate: 'Site visit dates cannot overlap. Choose different dates' }
          : null;
      }
    }
    return null;
  };
}

function getDates(visitDateFormGroup: FormGroup<AerInPersonSiteVisitDatesFormGroupModel>): Date[] {
  if (!visitDateFormGroup.get('startDate').valid || !visitDateFormGroup.get('numberOfDays').valid) {
    return [];
  }

  let currentDate = visitDateFormGroup.controls.startDate.value;
  let daysToAdd = visitDateFormGroup.controls.numberOfDays.value ?? 0;
  const dates: Date[] = [];

  if (currentDate) {
    while (daysToAdd > 0) {
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
      daysToAdd--;
    }
  }

  return dates;
}
