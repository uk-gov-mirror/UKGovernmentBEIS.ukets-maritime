import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PageHeadingComponent } from '@netz/common/components';
import { LinkDirective } from '@netz/govuk-components';

@Component({
  selector: 'netz-page-not-found',
  imports: [PageHeadingComponent, LinkDirective],
  standalone: true,
  template: `
    <netz-page-heading size="xl">Page Not Found</netz-page-heading>
    <p class="govuk-body">If you typed the web address, check it is correct.</p>
    <p class="govuk-body">If you pasted the web address, check you copied the entire address.</p>
    <p class="govuk-body">
      If the web address is correct,
      <a govukLink href="/contact-us">contact your regulator</a>
      for help.
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFoundComponent {}
