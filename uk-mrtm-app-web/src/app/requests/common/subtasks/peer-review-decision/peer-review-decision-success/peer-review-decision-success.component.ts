import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BreadcrumbService } from '@netz/common/navigation';
import { LinkDirective, PanelComponent } from '@netz/govuk-components';

import { PEER_REVIEW_DECISION_TEXT_MAP } from '@requests/common/subtasks/peer-review-decision/peer-review-decision.providers';

@Component({
  selector: 'mrtm-emp-peer-review-decision-success',
  imports: [PanelComponent, RouterLink, LinkDirective],
  standalone: true,
  templateUrl: './peer-review-decision-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeerReviewDecisionSuccessComponent implements OnInit {
  readonly breadcrumbService = inject(BreadcrumbService);
  readonly map = inject(PEER_REVIEW_DECISION_TEXT_MAP);

  ngOnInit() {
    this.breadcrumbService.showDashboardBreadcrumb();
  }
}
