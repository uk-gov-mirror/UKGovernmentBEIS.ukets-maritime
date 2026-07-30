import { TestBed } from '@angular/core/testing';
import { CanActivateFn, GuardResult, Router } from '@angular/router';

import { lastValueFrom, Observable, of } from 'rxjs';

import { RequestItemsService, RequestsService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ActivatedRouteSnapshotStub } from '@netz/common/testing';

import { CREATE_ACTION_TYPE } from '@requests/common/types';
import { WorkflowStore } from '@requests/workflows/+state';
import { CREATE_ACTION } from '@requests/workflows/create-action/create-action.helpers';
import { requestCreateActionGuard } from '@requests/workflows/create-action/request-create-action.guard';
import { Mocked } from 'vitest';

describe('requestCreateActionGuard', () => {
  let router: Router;
  let requestsService: Partial<Mocked<RequestsService>>;
  let requestItemsService: Partial<Mocked<RequestItemsService>>;
  let authStore: AuthStore;
  let workflowStore: WorkflowStore;

  const executeGuard: CanActivateFn = (route: ActivatedRouteSnapshotStub) =>
    TestBed.runInInjectionContext(() => requestCreateActionGuard(route, null));

  beforeEach(() => {
    requestsService = {
      processRequestCreateAction: vi.fn().mockReturnValue(of({})),
    };

    requestItemsService = {
      getItemsByRequest: vi.fn().mockReturnValue(
        of({
          items: [
            {
              creationDate: '2025-02-27T15:30:54.264089Z',
              requestId: 'DOE00004-2023-1',
              requestType: 'DOE',
              taskId: 123,
              taskAssignee: {
                firstName: 'Regulator',
                lastName: 'England',
              },
              taskAssigneeType: 'REGULATOR',
              taskType: 'DOE_APPLICATION_SUBMIT',
              accountId: 4,
              accountName: 'OperatorAccount4',
              competentAuthority: 'ENGLAND',
              isNew: false,
            },
          ],
          totalItems: 1,
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: RequestsService, useValue: requestsService },
        { provide: RequestItemsService, useValue: requestItemsService },
        { provide: CREATE_ACTION, useValue: CREATE_ACTION_TYPE.DOE },
      ],
    });

    authStore = TestBed.inject(AuthStore);
    authStore.setUserState({
      roleType: 'REGULATOR',
    });
    router = TestBed.inject(Router);
    workflowStore = TestBed.inject(WorkflowStore);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should call processRequestCreateAction and redirect to tasks when valid aerRelatedTasks', async () => {
    workflowStore.setState({
      aerRelatedTasks: ['DOE'],
    });
    const route = new ActivatedRouteSnapshotStub({
      accountId: '4',
      workflowId: 'MAR00004-2023',
      requestCreateActionType: 'DOE',
    });
    const result$ = executeGuard(route, null) as Observable<GuardResult>;

    await expect(lastValueFrom(result$)).resolves.toEqual(router.parseUrl('/tasks/123'));
    expect(requestsService.processRequestCreateAction).toHaveBeenCalledTimes(1);
    expect(requestsService.processRequestCreateAction).toHaveBeenLastCalledWith(
      {
        requestCreateActionPayload: {
          payloadType: 'REPORT_RELATED_REQUEST_CREATE_ACTION_PAYLOAD',
          requestId: 'MAR00004-2023',
        },
        requestType: 'DOE',
      },
      '4',
    );
  });

  it('should redirect to dashboard with no aerRelatedTasks', async () => {
    workflowStore.setState({
      aerRelatedTasks: null,
    });
    const route = new ActivatedRouteSnapshotStub({
      accountId: '4',
      workflowId: 'MAR00004-2023',
      requestCreateActionType: 'DOE',
    });
    const result$ = executeGuard(route, null) as Observable<GuardResult>;

    await expect(lastValueFrom(result$)).resolves.toEqual(router.parseUrl('/dashboard'));
  });

  it('should redirect to dashboard with userRoleType is not REGULATOR', async () => {
    authStore.setUserState({
      roleType: 'OPERATOR',
    });
    workflowStore.setState({
      aerRelatedTasks: ['DOE'],
    });
    const route = new ActivatedRouteSnapshotStub({
      accountId: '4',
      workflowId: 'MAR00004-2023',
      requestCreateActionType: 'DOE',
    });
    const result$ = executeGuard(route, null) as Observable<GuardResult>;

    await expect(lastValueFrom(result$)).resolves.toEqual(router.parseUrl('/dashboard'));
  });
});
