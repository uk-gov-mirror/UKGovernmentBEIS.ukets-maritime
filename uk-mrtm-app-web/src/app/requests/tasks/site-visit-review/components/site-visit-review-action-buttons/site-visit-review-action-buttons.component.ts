import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, WarningTextComponent } from '@netz/govuk-components';

import { TaskItemStatus } from '@requests/common';
import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import { APPLICATION_DETAILS_SUBTASK } from '@requests/common/site-visit/subtasks/application-details';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';

@Component({
  selector: 'mrtm-site-visit-review-acction-buttons',
  imports: [ButtonDirective, RouterLink, WarningTextComponent],
  template: `
    @if (canBeDisplayed() && !isWaitForPeerReview()) {
      <div class="govuk-button-group">
        @if (sendForAmends()) {
          <a govukButton [routerLink]="['site-visit-review', 'return-for-changes']">Return for changes</a>
        } @else {
          <a govukButton [routerLink]="['site-visit-review', 'notify-operator']">Notify operator of decision</a>
          <a govukButton [routerLink]="['site-visit-review', 'peer-review']">Send for peer review</a>
        }
      </div>
    }
    @if (isWaitForPeerReview()) {
      <govuk-warning-text assistiveText="Waiting for peer review. You cannot make any changes." />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteVisitReviewActionButtonsComponent {
  private readonly store = inject(RequestTaskStore);

  readonly sendForAmends = computed(() => {
    return (
      this.store.select(siteVisitReviewQuery.selectReviewDecisionDTO)()?.type === TaskItemStatus.OPERATOR_AMENDS_NEEDED
    );
  });

  readonly isWaitForPeerReview = computed(() => {
    return this.store.select(requestTaskQuery.selectRequestTaskType)() === 'SITE_VISIT_WAIT_FOR_PEER_REVIEW';
  });

  readonly canBeDisplayed = computed(() => {
    const isEditable = this.store.select(requestTaskQuery.selectIsEditable)();
    const isSubtaskCompleted = [
      TaskItemStatus.ACCEPTED,
      TaskItemStatus.REJECTED,
      TaskItemStatus.OPERATOR_AMENDS_NEEDED,
      TaskItemStatus.COMPLETED,
    ].includes(this.store.select(siteVisitCommonQuery.selectStatusForSubtask(APPLICATION_DETAILS_SUBTASK))());

    return isEditable && isSubtaskCompleted;
  });
}
