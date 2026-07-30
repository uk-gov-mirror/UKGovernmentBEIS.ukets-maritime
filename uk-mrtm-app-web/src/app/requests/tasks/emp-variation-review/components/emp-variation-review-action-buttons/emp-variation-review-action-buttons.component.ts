import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { empVariationReviewQuery } from '@requests/common/emp/+state';

@Component({
  selector: 'mrtm-emp-variation-review-action-buttons',
  imports: [ButtonDirective, RouterLink],
  standalone: true,
  template: `
    @if (isEditable()) {
      <div class="govuk-button-group">
        @if (isOverallDecisionCompleted()) {
          <a govukButton [routerLink]="['emp-variation-review', 'notify-operator']">Notify operator of decision</a>
          <a govukSecondaryButton [routerLink]="['emp-variation-review', 'peer-review']">Send for peer review</a>
        }
        @if (hasOperatorAmendsNeeded()) {
          <a govukButton [routerLink]="['emp-variation-review', 'return-for-amends']">Return for amends</a>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpVariationReviewActionButtonsComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);

  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable);
  readonly hasOperatorAmendsNeeded = this.store.select(empVariationReviewQuery.selectAnySubtaskNeedsAmend);
  readonly isOverallDecisionCompleted = this.store.select(empVariationReviewQuery.selectIsOverallDecisionCompleted);
}
