import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BreadcrumbService } from '@netz/common/navigation';
import { LinkDirective, PanelComponent } from '@netz/govuk-components';

@Component({
  selector: 'mrtm-send-for-peer-review-success',
  imports: [PanelComponent, RouterLink, LinkDirective],
  standalone: true,
  templateUrl: './send-for-peer-review-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendForPeerReviewSuccessComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly breadcrumbsService = inject(BreadcrumbService);
  public readonly assignedTo = this.router.currentNavigation()?.extras?.state?.assignedTo;

  public ngOnInit(): void {
    this.breadcrumbsService.showDashboardBreadcrumb();
  }
}
