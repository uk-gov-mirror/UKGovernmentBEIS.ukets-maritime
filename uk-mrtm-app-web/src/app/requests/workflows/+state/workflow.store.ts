import { Service } from '@angular/core';

import { SignalStore } from '@netz/common/store';

import { WorkflowState } from '@requests/workflows/workflows.types';

@Service()
export class WorkflowStore extends SignalStore<WorkflowState> {
  constructor() {
    super({});
  }
}
