import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BreadcrumbService } from '@netz/common/navigation';
import { LinkDirective, PanelComponent } from '@netz/govuk-components';

@Component({
  selector: 'mrtm-site-visit-return-for-changes-success',
  imports: [LinkDirective, RouterLink, PanelComponent],
  standalone: true,
  templateUrl: './return-for-changes-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnForChangesSuccessComponent implements OnInit {
  private readonly breadcrumbsService = inject(BreadcrumbService);

  ngOnInit(): void {
    this.breadcrumbsService.showDashboardBreadcrumb();
  }
}
