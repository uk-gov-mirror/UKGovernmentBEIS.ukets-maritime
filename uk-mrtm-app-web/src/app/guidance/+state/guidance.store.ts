import { Service } from '@angular/core';

import { produce } from 'immer';

import { GuidanceSectionsResponseDTO } from '@mrtm/api';

import { SignalStore } from '@netz/common/store';

import { GuidanceState, ManageGuidanceDTO } from '@guidance/guidance.types';

@Service()
export class GuidanceStore extends SignalStore<GuidanceState> {
  constructor() {
    super({
      guidanceSections: {},
      editable: false,
    });
  }

  public setGuidanceSections(sections: GuidanceSectionsResponseDTO['guidanceSections']): void {
    this.setState(
      produce(this.state, (state) => {
        state.guidanceSections = sections;
      }),
    );
  }

  public setIsEditable(isEditable: boolean): void {
    this.setState(
      produce(this.state, (state) => {
        state.editable = isEditable;
      }),
    );
  }

  public updateManageGuidance(manageGuidance: ManageGuidanceDTO): void {
    this.setState(
      produce(this.state, (state) => {
        state.manage = {
          ...state.manage,
          ...manageGuidance,
        };
      }),
    );
  }

  public resetManageGuidanceState(): void {
    this.setState(
      produce(this.state, (state) => {
        state.manage = null;
      }),
    );
  }
}
