import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BreadcrumbService } from '@netz/common/navigation';
import { LinkDirective, PanelComponent } from '@netz/govuk-components';

import { NOTIFY_OPERATOR_SUCCESS_COMPONENT } from '@requests/common/components/notify-operator/notify-operator.providers';

@Component({
  selector: 'mrtm-notify-operator-success',
  imports: [NgComponentOutlet, PanelComponent, RouterLink, LinkDirective],
  standalone: true,
  templateUrl: './notify-operator-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotifyOperatorSuccessComponent implements OnInit {
  private readonly breadcrumbService = inject(BreadcrumbService);
  public readonly successComponent = inject(NOTIFY_OPERATOR_SUCCESS_COMPONENT, { optional: true });

  ngOnInit(): void {
    this.breadcrumbService.showDashboardBreadcrumb();
  }
}
