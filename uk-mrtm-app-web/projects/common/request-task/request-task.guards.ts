import { inject, Injector, runInInjectionContext } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';

import { catchError, concatMap, map, of } from 'rxjs';

import { RequestActionsService, RequestItemsService, TasksService } from '@mrtm/api';

import { PendingRequestService } from '@netz/common/services';
import { RequestTaskStore } from '@netz/common/store';

import { REQUEST_TASK_IS_EDITABLE_RESOLVER } from './request-task.providers';
import { RequestTaskIsEditableResolver } from './request-task.types';

export function getRequestTaskPageDefaultCanActivateGuard(taskIdParam = 'taskId'): CanActivateFn {
  return (route) => {
    const injector = inject(Injector);
    const router = inject(Router);
    const store = inject(RequestTaskStore);
    const tasksService = inject(TasksService);
    const requestActionsService = inject(RequestActionsService);
    const requestItemsService = inject(RequestItemsService);
    const editableResolver: RequestTaskIsEditableResolver = inject(REQUEST_TASK_IS_EDITABLE_RESOLVER);
    const pendingRequestService = inject(PendingRequestService);

    const id = +route.paramMap.get(taskIdParam);
    if (!route.paramMap.has(taskIdParam) || Number.isNaN(id)) {
      console.warn(`No :${taskIdParam} param in route`);
      return true;
    }

    return tasksService.getTaskItemInfoById(id).pipe(
      concatMap((requestTaskItem) => {
        return requestActionsService
          .getRequestActionsByRequestId(requestTaskItem.requestInfo.id)
          .pipe(map((timeline) => ({ requestTaskItem, timeline })));
      }),
      concatMap(({ requestTaskItem, timeline }) => {
        return requestItemsService.getItemsByRequest(requestTaskItem.requestInfo.id).pipe(
          map(({ items: relatedTasks }) => {
            store.setRequestTaskItem(requestTaskItem);
            store.setTimeline(timeline);
            store.setRelatedTasks(relatedTasks);
            store.setIsEditable(runInInjectionContext(injector, editableResolver));

            return true;
          }),
        );
      }),
      pendingRequestService.trackRequest(),
      catchError((error) => {
        console.error(error);
        return of(router.createUrlTree(['dashboard']));
      }),
    );
  };
}

export function getRequestTaskPageCanDeactivateGuard(): CanDeactivateFn<unknown> {
  return () => {
    inject(RequestTaskStore).reset();
    return true;
  };
}
