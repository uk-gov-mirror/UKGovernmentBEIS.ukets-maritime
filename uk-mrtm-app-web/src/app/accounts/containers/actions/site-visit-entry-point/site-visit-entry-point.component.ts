import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { filter, first, map, switchMap } from 'rxjs';

import { RequestItemsService, RequestsService } from '@mrtm/api';

import { ITEM_LINK_REQUEST_TYPES_WHITELIST, ItemLinkPipe } from '@netz/common/pipes';
import { PendingRequestService } from '@netz/common/services';
import { LinkDirective, RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import {
  SITE_VISIT_ENTRY_POINT_FORM,
  siteVisitEntryPointFormProvider,
} from '@accounts/containers/actions/site-visit-entry-point/site-visit-entry-point-form.provider';
import { WizardStepComponent } from '@shared/components';
import { requestTypesWhitelistForItemLinkPipe } from '@shared/constants';

@Component({
  selector: 'mrtm-site-visit-entry-point',
  imports: [WizardStepComponent, LinkDirective, RouterLink, RadioComponent, RadioOptionComponent, ReactiveFormsModule],
  templateUrl: './site-visit-entry-point.component.html',
  providers: [
    siteVisitEntryPointFormProvider,
    { provide: ITEM_LINK_REQUEST_TYPES_WHITELIST, useValue: requestTypesWhitelistForItemLinkPipe },
    ItemLinkPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteVisitEntryPointComponent {
  private readonly requestsService = inject(RequestsService);
  private readonly requestItemsService = inject(RequestItemsService);
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly router = inject(Router);
  private readonly itemLinkPipe = inject(ItemLinkPipe);

  readonly formGroup = inject(SITE_VISIT_ENTRY_POINT_FORM);
  readonly accountId = input<number>();

  readonly availableYears = toSignal(
    toObservable(this.accountId).pipe(
      filter((accountId): accountId is number => accountId != null),
      switchMap((accountId) => this.requestsService.getAvailableSiteVisitWorkflows(accountId).pipe(first())),
      map((res) =>
        Object.entries(res)
          .filter(([, value]) => value?.valid)
          .map(([year]) => year)
          .sort((a, b) => Number(b) - Number(a)),
      ),
    ),
  );

  protected onSubmit() {
    this.requestsService
      .processRequestCreateAction(
        {
          requestType: 'SITE_VISIT',
          requestCreateActionPayload: this.formGroup.value,
        },
        this.accountId().toString(),
      )
      .pipe(
        this.pendingRequestService.trackRequest(),
        switchMap(({ requestId }) => this.requestItemsService.getItemsByRequest(requestId)),
        first(),
      )
      .subscribe(({ items }) => {
        const link = items?.length == 1 ? this.itemLinkPipe.transform(items[0]) : ['/dashboard'];
        this.router.navigate(link).then();
      });
  }
}
