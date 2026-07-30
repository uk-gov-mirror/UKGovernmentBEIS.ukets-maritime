import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthStore, selectUserId } from '@netz/common/auth';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { empVariationReviewQuery } from '@requests/common/emp/+state';

@Component({
  selector: 'mrtm-emp-variation-peer-review-action-buttons',
  imports: [ButtonDirective, RouterLink],
  standalone: true,
  template: `
    @if (canBeDisplayed()) {
      <div class="govuk-button-group">
        <a govukButton [routerLink]="['emp-variation-peer-review', 'review-decision']">Peer review decision</a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpVariationPeerReviewActionButtonsComponent {
  private readonly requestTaskStore: RequestTaskStore = inject(RequestTaskStore);
  private readonly authStore: AuthStore = inject(AuthStore);

  readonly canBeDisplayed = computed(
    () =>
      !this.requestTaskStore.select(requestTaskQuery.selectFinalDocumentsGenerationInProgress)() &&
      this.authStore.select(selectUserId)() === this.requestTaskStore.select(requestTaskQuery.selectAssigneeUserId)() &&
      this.requestTaskStore
        .select(requestTaskQuery.selectAllowedRequestTaskActions)()
        ?.includes('EMP_VARIATION_REVIEW_SUBMIT_PEER_REVIEW_DECISION') &&
      this.requestTaskStore.select(empVariationReviewQuery.selectIsOverallDecisionCompleted)(),
  );
}
