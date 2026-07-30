import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LinkDirective, PanelComponent } from '@netz/govuk-components';

@Component({
  selector: 'mrtm-review-notify-operator-success',
  imports: [PanelComponent, RouterLink, LinkDirective],
  standalone: true,
  templateUrl: './emp-review-notify-operator-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpReviewNotifyOperatorSuccessComponent {}
