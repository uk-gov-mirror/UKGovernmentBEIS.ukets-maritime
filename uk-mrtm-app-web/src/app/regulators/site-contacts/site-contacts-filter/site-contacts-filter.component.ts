import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { map } from 'rxjs';

import { MaritimeAccountsService } from '@mrtm/api';

import { ButtonDirective } from '@netz/govuk-components';

import { initialSiteContactsFiltersState, selectFilters, SiteContactsStore } from '@regulators/site-contacts/+store';
import { AutocompleteSelectComponent, AutocompleteSelectOption } from '@shared/components/autocomplete-select';
import { isEqual } from '@shared/utils';

export const ALL_ACCOUNTS_VALUE: AutocompleteSelectOption<string> = { text: '', data: null };

@Component({
  selector: 'mrtm-site-contacts-filter',
  imports: [ReactiveFormsModule, ButtonDirective, AutocompleteSelectComponent],
  standalone: true,
  templateUrl: './site-contacts-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteContactsFilterComponent {
  private readonly accountsService = inject(MaritimeAccountsService);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly store = inject(SiteContactsStore);

  private readonly filters = this.store.select(selectFilters);
  protected readonly hasAppliedFilters = computed<boolean>(
    () => !isEqual(this.filters(), initialSiteContactsFiltersState),
  );
  readonly relatedAccounts = toSignal(
    this.accountsService.getMrtmAccountsInfoByUser().pipe(
      map((accounts) =>
        accounts.map<AutocompleteSelectOption<string>>((account) => ({
          data: account.businessId,
          text: `${account.name} (ID: ${account.businessId})`,
        })),
      ),
    ),
    {
      initialValue: [],
    },
  );
  protected readonly accountsSuggestions = computed(() => {
    return (this.relatedAccounts() ?? [])
      .slice()
      .sort((a, b) => a.text.localeCompare(b.text, 'en-GB', { sensitivity: 'base' }));
  });

  readonly formGroup: UntypedFormGroup = this.fb.group(
    {
      filterByAccount: this.fb.control(this.filters().businessId ?? ALL_ACCOUNTS_VALUE),
    },
    { updateOn: 'change' },
  );

  onClearFiltersClick(): void {
    this.formGroup.reset({ filterByAccount: ALL_ACCOUNTS_VALUE });
    this.store.setFilters(initialSiteContactsFiltersState);
  }

  onSubmit(): void {
    const account = this.formGroup.controls.filterByAccount.value;

    this.store.setFilters({ businessId: account?.data ? account : null });
  }
}
