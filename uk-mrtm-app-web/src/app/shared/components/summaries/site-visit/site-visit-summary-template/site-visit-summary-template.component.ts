import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

import {
  LinkDirective,
  SummaryListComponent,
  SummaryListRowActionsDirective,
  SummaryListRowDirective,
  SummaryListRowKeyDirective,
  SummaryListRowValueDirective,
} from '@netz/govuk-components';

import { SummaryDownloadFilesComponent } from '@shared/components';
import { NotProvidedDirective } from '@shared/directives';
import { SiteVisitApplicationDetailsDto } from '@shared/types';

@Component({
  selector: 'mrtm-site-visit-summary-template',
  imports: [
    SummaryListComponent,
    SummaryListRowDirective,
    SummaryListRowKeyDirective,
    SummaryListRowValueDirective,
    NotProvidedDirective,
    LinkDirective,
    SummaryListRowActionsDirective,
    RouterLink,
    SummaryDownloadFilesComponent,
  ],
  templateUrl: './site-visit-summary-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteVisitSummaryTemplateComponent {
  readonly isEditable = input(false);
  readonly model = input<SiteVisitApplicationDetailsDto>();
  readonly queryParams = input<Params>({ change: true });
  readonly wizardStep = input<Record<string, any>>();
}
