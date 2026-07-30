import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BreadcrumbService } from '@netz/common/navigation';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { LinkDirective, PanelComponent } from '@netz/govuk-components';

import { recallActionsMap } from '@requests/common/recall-actions.map';

@Component({
  selector: 'mrtm-recall-success',
  imports: [LinkDirective, RouterLink, PanelComponent],
  standalone: true,
  templateUrl: './recall-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecallSuccessComponent implements OnInit {
  private readonly breadcrumbsService = inject(BreadcrumbService);
  private readonly store = inject(RequestTaskStore);
  private readonly requestTask = this.store.select(requestTaskQuery.selectRequestTaskType)();

  public readonly actionMap = recallActionsMap?.[this.requestTask];

  ngOnInit(): void {
    this.breadcrumbsService.showDashboardBreadcrumb();
  }
}
