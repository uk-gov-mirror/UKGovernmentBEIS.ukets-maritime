import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { firstValueFrom, of } from 'rxjs';

import { AccountClosureSubmitRequestTaskPayload, TasksService } from '@mrtm/api';

import { mockRequestTask } from '@netz/common/request-task';
import { PendingRequestService } from '@netz/common/services';
import { RequestTaskStore } from '@netz/common/store';
import { mockClass } from '@netz/common/testing';

import { AccountClosureStateService } from '@requests/tasks/account-closure/services';

describe('AccountClosureServiceService', () => {
  let stateService: AccountClosureStateService;
  let store: RequestTaskStore;

  const mockAccountClosure = { accountClosure: { reason: 'Test changed' } };
  const tasksService = mockClass(TasksService);
  tasksService.processRequestTaskAction.mockReturnValue(
    of({
      requestTaskId: 25,
      requestTaskActionType: 'ACCOUNT_CLOSURE_SAVE_APPLICATION',
      requestTaskActionPayload: {
        ...mockAccountClosure,
        payloadType: 'ACCOUNT_CLOSURE_SAVE_APPLICATION_PAYLOAD',
      },
    } as any),
  );
  const tasksServiceSubmit = mockClass(TasksService);
  tasksServiceSubmit.processRequestTaskAction.mockReturnValue(
    of({
      requestTaskId: 25,
      requestTaskActionType: 'ACCOUNT_CLOSURE_SUBMIT_APPLICATION',
      requestTaskActionPayload: {
        ...mockAccountClosure,
        payloadType: 'EMPTY_PAYLOAD',
      },
    } as any),
  );

  describe('service with save payload', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), { provide: TasksService, useValue: tasksService }, PendingRequestService],
      });
      stateService = TestBed.inject(AccountClosureStateService);
      store = TestBed.inject(RequestTaskStore);
      store.setState({
        ...mockRequestTask,
        requestTaskItem: {
          ...mockRequestTask.requestTaskItem,
          requestTask: {
            ...mockRequestTask.requestTaskItem.requestTask,
            payload: {
              payloadType: 'ACCOUNT_CLOSURE_SUBMIT_PAYLOAD',
              accountClosure: {
                reason: 'test',
              },
            } as AccountClosureSubmitRequestTaskPayload,
          },
        },
      });
    });

    it('should be created', () => {
      expect(stateService).toBeTruthy();
    });

    it('should return services with appropriate payloads', async () => {
      const tasksServiceSpy = vi.spyOn(tasksService, 'processRequestTaskAction');

      expect(stateService.payload).toEqual({
        accountClosure: { reason: 'test' },
        payloadType: 'ACCOUNT_CLOSURE_SUBMIT_PAYLOAD',
      });

      await expect(firstValueFrom(stateService.saveAccountClosure(mockAccountClosure))).resolves.toEqual({
        requestTaskActionPayload: {
          accountClosure: {
            reason: 'Test changed',
          },
          payloadType: 'ACCOUNT_CLOSURE_SAVE_APPLICATION_PAYLOAD',
        },
        requestTaskActionType: 'ACCOUNT_CLOSURE_SAVE_APPLICATION',
        requestTaskId: 25,
      });
      expect(tasksServiceSpy).toHaveBeenCalledTimes(1);

      await expect(firstValueFrom(stateService.submitAccountClosure())).resolves.toEqual({
        requestTaskActionPayload: {
          ...mockAccountClosure,
          payloadType: 'ACCOUNT_CLOSURE_SAVE_APPLICATION_PAYLOAD',
        },
        requestTaskActionType: 'ACCOUNT_CLOSURE_SAVE_APPLICATION',
        requestTaskId: 25,
      });
      expect(tasksServiceSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('service with submit payload', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          { provide: TasksService, useValue: tasksServiceSubmit },
          PendingRequestService,
        ],
      });
      stateService = TestBed.inject(AccountClosureStateService);
      store = TestBed.inject(RequestTaskStore);
      store.setState({
        ...mockRequestTask,
        requestTaskItem: {
          ...mockRequestTask.requestTaskItem,
          requestTask: {
            ...mockRequestTask.requestTaskItem.requestTask,
            payload: {
              payloadType: 'ACCOUNT_CLOSURE_SUBMIT_PAYLOAD',
              accountClosure: {
                reason: 'test',
              },
            } as AccountClosureSubmitRequestTaskPayload,
          },
        },
      });
    });

    it('should return services with appropriate payloads', async () => {
      const tasksServiceSpy = vi.spyOn(tasksServiceSubmit, 'processRequestTaskAction');

      await expect(firstValueFrom(stateService.submitAccountClosure())).resolves.toEqual({
        requestTaskActionPayload: {
          ...mockAccountClosure,
          payloadType: 'EMPTY_PAYLOAD',
        },
        requestTaskActionType: 'ACCOUNT_CLOSURE_SUBMIT_APPLICATION',
        requestTaskId: 25,
      });
      expect(tasksServiceSpy).toHaveBeenCalledTimes(1);
    });
  });
});
