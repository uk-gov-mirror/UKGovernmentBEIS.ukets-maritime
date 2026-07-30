import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import {
  SummaryListComponent,
  SummaryListRowDirective,
  SummaryListRowKeyDirective,
  SummaryListRowValueDirective,
} from '@netz/govuk-components';

@Component({
  selector: 'mrtm-site-visit-reporting-year-summary-template',
  imports: [SummaryListComponent, SummaryListRowDirective, SummaryListRowKeyDirective, SummaryListRowValueDirective],
  templateUrl: './site-visit-reporting-year-summary-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteVisitReportingYearSummaryTemplateComponent {
  readonly reportingYear = input.required<number>();
}
