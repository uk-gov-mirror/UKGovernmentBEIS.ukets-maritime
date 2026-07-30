import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BreadcrumbService } from '@netz/common/navigation';
import { LinkDirective, PanelComponent } from '@netz/govuk-components';

@Component({
  selector: 'mrtm-site-visit-submit-application-success',
  imports: [LinkDirective, RouterLink, PanelComponent],
  templateUrl: './site-visit-submit-application-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteVisitSubmitApplicationSuccessComponent implements OnInit {
  private readonly breadcrumbService = inject(BreadcrumbService);

  ngOnInit(): void {
    this.breadcrumbService.showDashboardBreadcrumb();
  }
}
