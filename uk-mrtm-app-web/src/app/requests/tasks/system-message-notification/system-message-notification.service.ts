import { inject, Service } from '@angular/core';

import { Observable } from 'rxjs';

import { RequestTaskActionProcessDTO, TasksService } from '@mrtm/api';

import {
  BusinessErrorService,
  catchNotFoundRequest,
  catchTaskReassignedBadRequest,
  ErrorCodes,
  requestTaskReassignedError,
  taskNotFoundError,
} from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { SystemMessageParsedPart } from '@requests/tasks/system-message-notification/system-message-notification.types';

@Service()
export class SystemMessageNotificationService {
  private readonly tasksService = inject(TasksService);
  private readonly store = inject(RequestTaskStore);
  private readonly businessErrorService = inject(BusinessErrorService);
  private readonly pendingRequestService = inject(PendingRequestService);

  parseMessage(messageText: string): SystemMessageParsedPart[] {
    if (!messageText) {
      return [];
    }

    // replaces ({&quot;action&quot;: &quot;ACTION_KEY&quot;}) with ({"action": "ACTION_KEY"})
    messageText = this.toHTML(messageText);

    // replaces route JSON params [Link text]({"action": "ACTION_KEY", "anyKey": "VALUE"}) with route string [Link text](url/path#fragment)
    messageText = messageText.replace(
      /\[([^\]]+)]\(\{[^}]+\}\)/gm,
      (routeParams, linkText) => `[${linkText}](${this.getRoute(JSON.parse(routeParams.match(/{.+}/gm)[0]))})`,
    );

    // splits message into parts of two types: pure text or router link
    return this.parseRouterLinks(messageText);
  }

  submit(): Observable<void> {
    return this.tasksService
      .processRequestTaskAction({
        requestTaskId: this.store.select(requestTaskQuery.selectRequestTaskId)(),
        requestTaskActionType: 'SYSTEM_MESSAGE_DISMISS',
        requestTaskActionPayload: { payloadType: 'EMPTY_PAYLOAD' },
      } as RequestTaskActionProcessDTO)
      .pipe(
        catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
          this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
        ),
        catchTaskReassignedBadRequest(() =>
          this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
        ),
        this.pendingRequestService.trackRequest(),
      );
  }

  private parseRouterLinks(messageText: string): SystemMessageParsedPart[] {
    // splits message into parts of two types: pure text or router links
    const linkRegex = /\[([^\]]+)\]\((\/[^)]*)\)/g;
    const parts: SystemMessageParsedPart[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(messageText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: messageText.slice(lastIndex, match.index) });
      }

      const fullRoute = match[2];
      const hashIndex = fullRoute.indexOf('#');
      const hasFragment = hashIndex !== -1;

      parts.push({
        text: match[1],
        route: hasFragment ? fullRoute.substring(0, hashIndex) : fullRoute,
        fragment: hasFragment ? fullRoute.substring(hashIndex + 1) : null,
      });
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < messageText.length) {
      parts.push({ text: messageText.slice(lastIndex) });
    }

    return parts;
  }

  private getRoute(params: { action: string } & { [key: string]: number }): string {
    switch (params?.action) {
      case 'ACCOUNT_USERS_SETUP':
        return `/accounts/${params.accountId}` + `#users`;
      case 'VERIFICATION_BODY_USERS_SETUP':
        return '/user/verifiers';
      default:
        return '/';
    }
  }

  private toHTML(text: string): string {
    return new DOMParser().parseFromString(text, 'text/html').documentElement?.textContent;
  }
}
