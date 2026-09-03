import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'govuk-skip-link',
  imports: [RouterLink],
  standalone: true,
  template: `
    <a class="govuk-skip-link" [routerLink]="[]" [fragment]="anchor()">Skip to main content</a>
  `,
})
export class SkipLinkComponent {
  readonly anchor = input('main-content');
}
