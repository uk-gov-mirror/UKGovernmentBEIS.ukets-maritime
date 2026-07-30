import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LinkDirective, PanelComponent } from '@netz/govuk-components';

@Component({
  selector: 'mrtm-notify-operator-success',
  imports: [PanelComponent, RouterLink, LinkDirective],
  standalone: true,
  templateUrl: './emp-variation-notify-operator-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpVariationNotifyOperatorSuccessComponent {}
