import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { SITE_VISIT_PEER_REVIEW_ROUTE_PREFIX } from '@requests/tasks/site-visit-peer-review/site-visit-peer-review.constants';

@Component({
  selector: 'mrtm-site-visit-peer-review-acction-buttons',
  imports: [ButtonDirective, RouterLink],
  template: `
    @if (isEditable()) {
      <div class="govuk-button-group">
        <a govukButton [routerLink]="[routePrefix, 'peer-review-decision']">Peer review decision</a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteVisitPeerReviewActionButtonsComponent {
  private readonly store = inject(RequestTaskStore);
  readonly routePrefix = SITE_VISIT_PEER_REVIEW_ROUTE_PREFIX;
  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable);
}
