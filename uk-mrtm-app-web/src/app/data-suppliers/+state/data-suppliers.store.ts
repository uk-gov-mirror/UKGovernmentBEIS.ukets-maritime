import { Service } from '@angular/core';

import { produce } from 'immer';

import { ThirdPartyDataProviderCreateDTO } from '@mrtm/api';

import { SignalStore } from '@netz/common/store';

import { DataSuppliersState } from '@data-suppliers/data-suppliers.types';

@Service()
export class DataSuppliersStore extends SignalStore<DataSuppliersState> {
  constructor() {
    super({});
  }

  setIsEditable(isEditable: boolean): void {
    this.setState(
      produce(this.state, (state) => {
        state.isEditable = isEditable;
      }),
    );
  }

  setItems(items: DataSuppliersState['items']): void {
    this.setState(
      produce(this.state, (state) => {
        state.items = items;
      }),
    );
  }

  setNewItem(item: ThirdPartyDataProviderCreateDTO): void {
    this.setState(
      produce(this.state, (state) => {
        state.newItem = item;
      }),
    );
  }

  resetNewItem(): void {
    this.setState(
      produce(this.state, (state) => {
        state.newItem = undefined;
      }),
    );
  }
}
