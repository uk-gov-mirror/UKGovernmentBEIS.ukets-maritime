import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthStore, selectUserId } from '@netz/common/auth';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { empReviewQuery } from '@requests/common/emp/+state';

@Component({
  selector: 'mrtm-emp-peer-review-action-buttons',
  imports: [ButtonDirective, RouterLink],
  standalone: true,
  template: `
    @if (canBeDisplayed()) {
      <div class="govuk-button-group">
        <a govukButton [routerLink]="['emp-peer-review', 'review-decision']">Peer review decision</a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpPeerReviewActionButtonsComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly authStore: AuthStore = inject(AuthStore);

  readonly canBeDisplayed = computed(
    () =>
      !this.store.select(requestTaskQuery.selectFinalDocumentsGenerationInProgress)() &&
      this.authStore.select(selectUserId)() === this.store.select(requestTaskQuery.selectAssigneeUserId)() &&
      this.store.select(empReviewQuery.selectIsOverallDecisionCompleted)() &&
      (this.store.select(requestTaskQuery.selectAllowedRequestTaskActions)() ?? []).includes(
        'EMP_ISSUANCE_REVIEW_SUBMIT_PEER_REVIEW_DECISION',
      ),
  );
}
