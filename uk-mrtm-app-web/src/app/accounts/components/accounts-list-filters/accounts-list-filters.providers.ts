import { InjectionToken, Provider } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { GovukValidators } from '@netz/govuk-components';

import {
  AccountListFilters,
  AccountListFiltersFormGroupModel,
} from '@accounts/components/accounts-list-filters/accounts-list-filters.types';

export const ACCOUNTS_LIST_FILTERS_FORM = new InjectionToken<FormGroup<AccountListFiltersFormGroupModel>>(
  'ACCOUNTS_LIST_FILTERS_FORM',
);

export const provideAccountsListFiltersForm: Provider = {
  provide: ACCOUNTS_LIST_FILTERS_FORM,
  deps: [FormBuilder, ActivatedRoute],
  useFactory: (fb: FormBuilder, activatedRoute: ActivatedRoute): FormGroup<AccountListFiltersFormGroupModel> => {
    const queryParams = activatedRoute.snapshot.queryParams ?? {};
    return fb.group<AccountListFiltersFormGroupModel>(
      {
        term: fb.control<AccountListFilters['term']>(queryParams['term'] ?? null, {
          validators: [
            GovukValidators.minLength(3, 'Enter at least 3 characters'),
            GovukValidators.maxLength(256, 'Enter up to 256 characters'),
          ],
        }),
        status: fb.control<AccountListFilters['status']>(queryParams['status'] ?? null),
        contactEmail: fb.control<AccountListFilters['contactEmail']>(queryParams['contactEmail'] ?? null),
      },
      {
        updateOn: 'submit',
      },
    );
  },
};
