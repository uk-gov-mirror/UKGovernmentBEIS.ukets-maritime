import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BreadcrumbService } from '@netz/common/navigation';
import { LinkDirective, PanelComponent } from '@netz/govuk-components';

@Component({
  selector: 'mrtm-confirmation-shared',
  imports: [LinkDirective, PanelComponent, RouterLink, NgTemplateOutlet],
  standalone: true,
  template: `
    <div class="govuk-grid-row">
      <div class="govuk-grid-column-two-thirds">
        <govuk-panel class="pre-wrap" [title]="title()">
          {{ titleReferenceText() }}
          <div style="font-weight: bold;">{{ titleReferenceId() }}</div>
        </govuk-panel>
        <ng-container
          *ngTemplateOutlet="whatHappensNextTemplate() ? whatHappensNextTemplate() : defaultWhatHappensNextTemplate" />
        <ng-template #defaultWhatHappensNextTemplate />
        <a govukLink [routerLink]="returnToLink()">Return to dashboard</a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationSharedComponent implements OnInit {
  protected readonly breadcrumbs = inject(BreadcrumbService);
  readonly title = input<string>();
  readonly titleReferenceText = input<string>();
  readonly titleReferenceId = input<string>();
  readonly whatHappensNextTemplate = input<TemplateRef<any>>();

  readonly returnToLink = input('/dashboard');

  ngOnInit(): void {
    this.breadcrumbs.showDashboardBreadcrumb();
  }
}
