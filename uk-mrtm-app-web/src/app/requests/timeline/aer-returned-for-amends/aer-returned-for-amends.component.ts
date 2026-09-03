import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthStore, selectUserRoleType } from '@netz/common/auth';
import { RequestActionStore } from '@netz/common/store';

import { AER_REVIEW_SUBTASK_TO_TITLE_MAP } from '@requests/common/aer/common';
import { aerReturnedForAmendsQuery } from '@requests/timeline/aer-returned-for-amends/+state';
import { ReviewReturnForAmendsSubtaskSummaryTemplateComponent } from '@shared/components';

@Component({
  selector: 'mrtm-aer-returned-for-amends',
  imports: [ReviewReturnForAmendsSubtaskSummaryTemplateComponent],
  standalone: true,
  templateUrl: './aer-returned-for-amends.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerReturnedForAmendsComponent {
  private readonly store = inject(RequestActionStore);
  private readonly authStore = inject(AuthStore);
  readonly decisions = this.store.select(aerReturnedForAmendsQuery.selectAmendsDecisions);

  readonly subtaskTitleMap = AER_REVIEW_SUBTASK_TO_TITLE_MAP;
  readonly userRoleType = this.authStore.select(selectUserRoleType);
}
