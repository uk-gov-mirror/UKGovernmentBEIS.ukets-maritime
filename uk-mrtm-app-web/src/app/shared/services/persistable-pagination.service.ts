import { Service } from '@angular/core';

import { produce } from 'immer';

import { SignalStore } from '@netz/common/store';
import { SortEvent } from '@netz/govuk-components';

export interface PersistablePaginationState {
  currentPage?: number;
  currentSorting?: SortEvent;
  activeFilters?: Record<string, any>;
  fragment?: string;
}

export const persistablePaginationQuery = {
  currentPage: (state: PersistablePaginationState) => state?.currentPage,
  currentSorting: (state: PersistablePaginationState) => state?.currentSorting,
  activeFilters: (state: PersistablePaginationState) => state?.activeFilters,
  fragment: (state: PersistablePaginationState) => state?.fragment,
};

@Service()
export class PersistablePaginationService extends SignalStore<Record<string, PersistablePaginationState>> {
  constructor() {
    super({});
  }

  public setCurrentState(key: string, newState: PersistablePaginationState): void {
    this.setState(
      produce(this.state, (state) => {
        state[key] = newState;
      }),
    );
  }

  public getCurrentState(key: string): PersistablePaginationState {
    return this.state[key] || {};
  }
}
