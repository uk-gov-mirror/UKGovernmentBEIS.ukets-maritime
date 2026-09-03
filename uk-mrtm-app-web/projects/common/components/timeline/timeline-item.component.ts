import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { RequestActionInfoDTO } from '@mrtm/api';

import { DebounceDirective } from '@netz/common/directives';
import { GovukDatePipe, ITEM_ACTIONS_MAP, ItemActionHeaderPipe, ItemActionsMap } from '@netz/common/pipes';
import { getYearFromRequestId } from '@netz/common/utils';
import { LinkDirective } from '@netz/govuk-components';

@Component({
  selector: 'netz-timeline-item',
  imports: [ItemActionHeaderPipe, GovukDatePipe, RouterLink, LinkDirective, DebounceDirective],
  standalone: true,
  template: `
    <div class="govuk-body govuk-!-margin-bottom-0">
      <h3 class="govuk-heading-s govuk-!-margin-bottom-1">
        {{ action() | itemActionHeader: getYearFromRequestId(requestId()) }}
      </h3>
      <p class="govuk-body govuk-!-margin-bottom-1">{{ action().creationDate | govukDate: 'datetime' }}</p>
      @if (isLinkable() && link()) {
        <a [routerLink]="link()" [relativeTo]="route" [state]="state()" govukLink netzDebounce>View details</a>
      }
    </div>
    <hr class="govuk-section-break govuk-section-break--m govuk-section-break--visible" aria-hidden="true" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineItemComponent {
  protected readonly route = inject(ActivatedRoute);
  private readonly itemActionsMap = inject<ItemActionsMap>(ITEM_ACTIONS_MAP);

  readonly action = input<RequestActionInfoDTO>();
  readonly link = input<any[]>();
  readonly state = input<any>();
  readonly requestId = input<string>();
  readonly isLinkable = computed(() => this.itemActionsMap[this.action().type]?.linkable);

  readonly getYearFromRequestId = getYearFromRequestId;
}
