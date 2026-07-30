import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { TASK_FORM } from '@requests/common';
import { AutocompleteSelectOption } from '@shared/components';
import { DashboardFiltersAndOrderBy, DashboardStore, selectFilters } from '@shared/dashboard/+store';
import { DashboardFiltersFormGroupModel } from '@shared/dashboard/components/dashboard-filters/dashboard-filters.types';

export const dashboardFiltersFormProvider = {
  provide: TASK_FORM,
  deps: [FormBuilder, DashboardStore],
  useFactory: (fb: FormBuilder, store: DashboardStore): FormGroup<DashboardFiltersFormGroupModel> => {
    const filters = store.select(selectFilters)();

    return fb.group<DashboardFiltersFormGroupModel>(
      {
        accountId: new FormControl<AutocompleteSelectOption | null>(filters?.accountId),
        workflowType: new FormControl<DashboardFiltersAndOrderBy['workflowType'] | null>(filters?.workflowType),
        orderBy: new FormControl<DashboardFiltersAndOrderBy['orderBy'] | null>(filters?.orderBy),
      },
      { updateOn: 'change' },
    );
  },
};
