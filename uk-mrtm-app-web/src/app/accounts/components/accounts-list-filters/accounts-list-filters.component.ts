import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { FeedbackBannerStore } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import {
  ButtonDirective,
  DetailsComponent,
  LinkDirective,
  SelectComponent,
  TextInputComponent,
} from '@netz/govuk-components';

import { ACCOUNTS_STATUS_SELECT_OPTIONS } from '@accounts/components/accounts-list-filters/accounts-list-filters.constants';
import {
  ACCOUNTS_LIST_FILTERS_FORM,
  provideAccountsListFiltersForm,
} from '@accounts/components/accounts-list-filters/accounts-list-filters.providers';
import { AccountListFilters } from '@accounts/components/accounts-list-filters/accounts-list-filters.types';

@Component({
  selector: 'mrtm-accounts-list-filters',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    ButtonDirective,
    PendingButtonDirective,
    DetailsComponent,
    SelectComponent,
    LinkDirective,
    RouterLink,
  ],
  templateUrl: './accounts-list-filters.component.html',
  providers: [provideAccountsListFiltersForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsListFiltersComponent implements OnInit {
  readonly formGroup = inject(ACCOUNTS_LIST_FILTERS_FORM);
  readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly filters = toSignal(this.formGroup.valueChanges, { initialValue: this.formGroup.value });
  protected readonly hasAppliedFilters = computed<boolean>(() => {
    return Object.values(this.mapToQueryParams(this.filters())).some((value) => value !== null);
  });

  readonly availableStatuses = ACCOUNTS_STATUS_SELECT_OPTIONS;

  public ngOnInit() {
    this.feedbackBannerStore.setInvalidFormLive(this.formGroup);
  }

  public onSubmit() {
    if (!this.formGroup.valid) {
      return;
    }

    this.router.navigate(['.'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        ...this.mapToQueryParams(this.formGroup.value),
        page: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private mapToQueryParams(formValue: Partial<AccountListFilters>): Partial<AccountListFilters> {
    const result: Partial<AccountListFilters> = {};

    for (const key in formValue) {
      result[key] = formValue[key]?.trim()?.length ? formValue[key].trim() : null;
    }

    return result;
  }
}
