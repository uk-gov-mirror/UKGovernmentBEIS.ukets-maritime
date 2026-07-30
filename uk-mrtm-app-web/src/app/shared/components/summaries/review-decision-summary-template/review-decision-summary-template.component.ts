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
import { ReviewDecisionTypePipe } from '@shared/pipes';
import { EmpVariationReviewDecisionDto, ReviewDecisionDto } from '@shared/types';

@Component({
  selector: 'mrtm-review-decision-summary-template',
  imports: [
    LinkDirective,
    SummaryDownloadFilesComponent,
    SummaryListComponent,
    SummaryListRowActionsDirective,
    SummaryListRowDirective,
    SummaryListRowKeyDirective,
    SummaryListRowValueDirective,
    RouterLink,
    NotProvidedDirective,
    ReviewDecisionTypePipe,
  ],
  standalone: true,
  templateUrl: './review-decision-summary-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDecisionSummaryTemplateComponent {
  readonly reviewDecision = input.required<ReviewDecisionDto | EmpVariationReviewDecisionDto>();
  readonly changeLink = input<string>();
  readonly isEditable = input(false);
  readonly queryParams = input<Params>({});
  readonly isPermittedUser = input<boolean>(true);
  readonly withOverallDecision = input(false);
}
