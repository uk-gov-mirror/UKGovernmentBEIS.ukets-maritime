import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { first, map, Observable, switchMap, withLatestFrom } from 'rxjs';

import {
  MrtmAccountStatus,
  RequestCreateValidationResult,
  RequestItemsService,
  RequestsService,
  UserStateDTO,
} from '@mrtm/api';

import { AuthStore, selectUserRoleType } from '@netz/common/auth';
import { PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { ITEM_LINK_REQUEST_TYPES_WHITELIST, ItemLinkPipe } from '@netz/common/pipes';
import { PendingRequestService } from '@netz/common/services';
import { ButtonDirective } from '@netz/govuk-components';

import {
  processActionsDetailsTypesMap,
  userRoleWorkflowsMap,
} from '@accounts/containers/process-actions/process-actions.map';
import { WorkflowLabel, WorkflowMap } from '@accounts/containers/process-actions/process-actions.types';
import { requestTypesWhitelistForItemLinkPipe } from '@shared/constants';
import { AccountStatusPipe } from '@shared/pipes';
import { MrtmRequestType } from '@shared/types';

@Component({
  selector: 'mrtm-process-actions',
  imports: [AsyncPipe, PageHeadingComponent, PendingButtonDirective, ButtonDirective, RouterLink],
  standalone: true,
  templateUrl: './process-actions.component.html',
  providers: [
    { provide: ITEM_LINK_REQUEST_TYPES_WHITELIST, useValue: requestTypesWhitelistForItemLinkPipe },
    ItemLinkPipe,
    AccountStatusPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessActionsComponent {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly requestsService: RequestsService = inject(RequestsService);
  private readonly requestItemsService: RequestItemsService = inject(RequestItemsService);
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly router: Router = inject(Router);
  private readonly itemLinkPipe: ItemLinkPipe = inject(ItemLinkPipe);
  private readonly accountStatusPipe: AccountStatusPipe = inject(AccountStatusPipe);
  private readonly pendingRequestService = inject(PendingRequestService);

  private accountId$ = this.activatedRoute.paramMap.pipe(map((parameters) => +parameters.get('accountId')));
  private userRoleWorkflowsMap: Record<UserStateDTO['roleType'], WorkflowMap> = userRoleWorkflowsMap;
  availableTasks$ = this.accountId$.pipe(
    switchMap((accountId) => this.requestsService.getAvailableWorkflows('ACCOUNT', accountId.toString())),
    withLatestFrom(
      this.authStore.rxSelect(selectUserRoleType).pipe(map((roleType) => this.userRoleWorkflowsMap[roleType])),
    ),
    map(([validationResults, userRoleWorkflowMessagesMap]) => {
      const order = Object.keys(userRoleWorkflowMessagesMap);
      return Object.entries(validationResults)
        .filter(([type]) => userRoleWorkflowMessagesMap[type])
        .map(([type, result]) => ({
          ...userRoleWorkflowMessagesMap[type],
          type: type,
          errors: result.valid ? undefined : this.createErrorMessages(type, result),
        }))
        .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
    }),
  ) as Observable<WorkflowLabel[]>;

  onRequestButtonClick(requestType: MrtmRequestType) {
    this.accountId$
      .pipe(
        switchMap((accountId) =>
          this.requestsService.processRequestCreateAction(
            {
              requestType: requestType,
              requestCreateActionPayload: {
                payloadType: 'EMPTY_PAYLOAD',
              },
            },
            accountId.toString(),
          ),
        ),
        switchMap(({ requestId }) => this.requestItemsService.getItemsByRequest(requestId)),
        first(),
        this.pendingRequestService.trackRequest(),
      )
      .subscribe(({ items }) => {
        const link = items?.length == 1 ? this.itemLinkPipe.transform(items[0]) : ['/dashboard'];
        this.router.navigate(link).then();
      });
  }

  private createErrorMessages(requestType: MrtmRequestType, result: RequestCreateValidationResult): string[] {
    const status = result?.accountStatus as unknown as MrtmAccountStatus;
    const typeString = processActionsDetailsTypesMap[requestType];

    if (status && !(result?.applicableAccountStatuses as unknown as MrtmAccountStatus)?.includes(status)) {
      const accountStatusString = this.accountStatusPipe.transform(status)?.toUpperCase();

      return [`You cannot start the ${typeString} while the account status is ${accountStatusString}.`];
    } else if (requestType === 'SITE_VISIT') {
      return [
        'there are no eligible reporting years',
        'an application is already in progress',
        'an application has been completed',
      ];
    } else {
      return result.requests.map((r) => this.createErrorMessage(requestType, r as MrtmRequestType));
    }
  }

  private createErrorMessage(currentRequestType: MrtmRequestType, resultRequestType: MrtmRequestType): string {
    const currentRequestTypeString = processActionsDetailsTypesMap[currentRequestType];
    const resultRequestTypeString = processActionsDetailsTypesMap[resultRequestType];

    if (currentRequestType === resultRequestType) {
      return `You cannot start the ${currentRequestTypeString} process as it is already in progress.`;
    } else {
      return `You cannot start the ${currentRequestTypeString} process while the ${resultRequestTypeString} is in progress.`;
    }
  }
}
