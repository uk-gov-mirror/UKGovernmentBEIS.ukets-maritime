import { Service } from '@angular/core';

import { SignalStore } from '@netz/common/store';

import { BatchVariationState } from '@batch-variations/batch-variations.types';

@Service()
export class BatchVariationStore extends SignalStore<BatchVariationState> {
  constructor() {
    super({});
  }
}
