import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LinkDirective } from '@netz/govuk-components';

@Component({
  selector: 'h2[mrtm-summary-header]',
  imports: [RouterLink, LinkDirective],
  standalone: true,
  template: `
    <ng-content />
    @if (changeRoute()) {
      <a
        [routerLink]="changeRoute()"
        (click)="changeClick.emit($event)"
        govukLink
        class="govuk-!-font-size-19 govuk-!-font-weight-regular float-right">
        Change
      </a>
    }
  `,
  host: { '[class.govuk-clearfix]': 'clearfix' },
})
export class SummaryHeaderComponent {
  readonly changeRoute = input<string | any[]>();
  readonly changeClick = output<Event>();

  get clearfix() {
    return true;
  }
}
