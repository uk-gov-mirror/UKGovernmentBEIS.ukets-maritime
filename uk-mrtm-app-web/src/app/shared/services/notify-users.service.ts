import { inject, Service } from '@angular/core';

import { map, Observable, pipe, shareReplay } from 'rxjs';

import {
  AccountOperatorsUsersAuthoritiesInfoDTO,
  CaExternalContactDTO,
  CaExternalContactsService,
  DecisionNotification,
  NotifyOperatorForDecisionRequestTaskActionPayload,
  OperatorAuthoritiesService,
  PeerReviewRequestTaskActionPayload,
  RequestActionUserInfo,
  TasksAssignmentService,
  TasksService,
  UserAuthorityInfoDTO,
} from '@mrtm/api';

import {
  BusinessErrorService,
  catchNotFoundRequest,
  catchTaskReassignedBadRequest,
  ErrorCodes,
  requestTaskReassignedError,
  taskNotFoundError,
} from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';
import { userFullNameTransformer } from '@netz/common/utils';
import { GovukSelectOption } from '@netz/govuk-components';

import { AccountOperatorUser, MrtmRequestTaskActionPayloadType, NotifyAccountOperatorUsersInfo } from '@shared/types';
import { MrtmRequestTaskActionType } from '@shared/types/mrtm-request-task-action-type.type';

@Service()
export class NotifyUsersService {
  private readonly operatorAuthoritiesService: OperatorAuthoritiesService = inject(OperatorAuthoritiesService);
  private readonly externalContactsService: CaExternalContactsService = inject(CaExternalContactsService);
  private readonly tasksAssignmentService: TasksAssignmentService = inject(TasksAssignmentService);
  private readonly businessErrorService: BusinessErrorService = inject(BusinessErrorService);
  private readonly tasksService = inject(TasksService);
  private readonly pendingRequestService = inject(PendingRequestService);

  getAllOperatorsInfo(accountId: number): Observable<{
    autoNotifiedOperators: NotifyAccountOperatorUsersInfo;
    otherOperators: NotifyAccountOperatorUsersInfo;
  }> {
    return this.getActiveOperatorUsers(accountId).pipe(
      map((users) => ({
        autoNotifiedOperators: users
          .filter((user) => user.contactTypes.includes('PRIMARY') || user.contactTypes.includes('SERVICE'))
          .reduce(this.notifyAccountOperatorUsersInfoReduceCallback, {}),
        otherOperators: users
          .filter((user) => !user.contactTypes.includes('PRIMARY') && !user.contactTypes.includes('SERVICE'))
          .reduce(this.notifyAccountOperatorUsersInfoReduceCallback, {}),
      })),
    );
  }

  getExternalContacts(): Observable<CaExternalContactDTO[]> {
    return this.externalContactsService.getCaExternalContacts().pipe(map((contacts) => contacts.caExternalContacts));
  }

  getAssignees(taskId: number): Observable<GovukSelectOption<string>[]> {
    return this.tasksAssignmentService.getCandidateAssigneesByTaskId(taskId).pipe(
      map((assignees) =>
        assignees
          .map((assignee) => ({ text: userFullNameTransformer(assignee), value: assignee.id }))
          .sort((a, b) => a.text?.localeCompare(b.text)),
      ),
      catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
        this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
      ),
    );
  }

  getAssigneesByTaskType(
    currentAssigneeId: string,
    taskId: number,
    taskType: string,
  ): Observable<GovukSelectOption<string>[]> {
    return this.tasksAssignmentService.getCandidateAssigneesByTaskType(taskId, taskType).pipe(
      map((assignees) =>
        assignees
          .filter((assignee) => assignee.id !== currentAssigneeId)
          .map((assignee) => ({
            text: userFullNameTransformer(assignee),
            value: assignee.id,
          }))
          .sort((a, b) => a.text?.localeCompare(b.text)),
      ),
    );
  }

  private getActiveOperatorUsers(accountId: number) {
    return this.operatorAuthoritiesService.getAccountOperatorAuthorities(accountId).pipe(
      map((accountOperatorsUsersAuthoritiesInfoDTO) => {
        return accountOperatorsUsersAuthoritiesInfoDTO.authorities
          .filter((authority) => authority.authorityStatus === 'ACTIVE')
          .map((authority) =>
            this.toAccountOperatorUser(authority, accountOperatorsUsersAuthoritiesInfoDTO.contactTypes),
          );
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private toAccountOperatorUser(
    userAuthorityInfo: UserAuthorityInfoDTO,
    contactTypes: AccountOperatorsUsersAuthoritiesInfoDTO['contactTypes'],
  ): AccountOperatorUser {
    return {
      firstName: userAuthorityInfo.firstName,
      lastName: userAuthorityInfo.lastName,
      roleCode: userAuthorityInfo.roleCode,
      userId: userAuthorityInfo.userId,
      contactTypes: Object.keys(contactTypes).filter((key) => contactTypes[key] === userAuthorityInfo.userId),
    };
  }

  private notifyAccountOperatorUsersInfoReduceCallback = (
    result: NotifyAccountOperatorUsersInfo,
    user: AccountOperatorUser,
  ): NotifyAccountOperatorUsersInfo => {
    return {
      ...result,
      [user.userId]: {
        contactTypes: user.contactTypes as RequestActionUserInfo['contactTypes'],
        name: user.firstName ? user.firstName + ' ' + user.lastName : user.lastName,
        roleCode: user.roleCode,
      },
    };
  };

  submitDecisionToOperator(
    taskId: number,
    decisionNotification: DecisionNotification,
    requestTaskActionType: MrtmRequestTaskActionType,
    payloadType: MrtmRequestTaskActionPayloadType,
  ) {
    return this.tasksService
      .processRequestTaskAction({
        requestTaskActionType: requestTaskActionType,
        requestTaskId: taskId,
        requestTaskActionPayload: {
          payloadType: payloadType,
          decisionNotification: decisionNotification,
        } as NotifyOperatorForDecisionRequestTaskActionPayload,
      })
      .pipe(this.handleForceNavigationError());
  }

  submitForPeerReview(
    taskId: number,
    peerReviewerId: string,
    requestTaskActionType: MrtmRequestTaskActionType,
    payloadType: MrtmRequestTaskActionPayloadType,
  ) {
    return this.tasksService
      .processRequestTaskAction({
        requestTaskActionType: requestTaskActionType,
        requestTaskId: taskId,
        requestTaskActionPayload: {
          payloadType: payloadType,
          peerReviewer: peerReviewerId,
        } as PeerReviewRequestTaskActionPayload,
      })
      .pipe(this.handleForceNavigationError());
  }

  private handleForceNavigationError() {
    return pipe(
      this.pendingRequestService.trackRequest(),
      catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
        this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
      ),
      catchTaskReassignedBadRequest(() =>
        this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
      ),
    );
  }
}
