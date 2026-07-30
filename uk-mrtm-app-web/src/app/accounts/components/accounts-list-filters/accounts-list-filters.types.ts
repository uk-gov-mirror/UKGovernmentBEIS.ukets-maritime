import { FormControl } from '@angular/forms';

export interface AccountListFilters {
  term: string;
  status: string;
  contactEmail: string;
}

export type AccountListFiltersFormGroupModel = Record<keyof AccountListFilters, FormControl>;
