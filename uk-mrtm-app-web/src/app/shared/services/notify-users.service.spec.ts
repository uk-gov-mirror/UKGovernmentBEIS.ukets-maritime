import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { firstValueFrom, of } from 'rxjs';

import { CaExternalContactsService, OperatorAuthoritiesService, TasksAssignmentService, TasksService } from '@mrtm/api';

import { MockType } from '@netz/common/testing';

import { NotifyUsersService } from '@shared/services';

describe('NotifyUsersService', () => {
  let service: NotifyUsersService;
  const tasksAssignmentService: MockType<TasksAssignmentService> = {
    getCandidateAssigneesByTaskId: vi.fn().mockReturnValue(
      of([
        {
          id: '22222222-2222-4222-a222-222222222222',
          firstName: 'Regulator2',
          lastName: 'England',
        },
        {
          id: '11111111-1111-4111-a111-111111111111',
          firstName: 'Regulator',
          lastName: 'England',
        },
      ]),
    ),
    getCandidateAssigneesByTaskType: vi.fn().mockReturnValue(
      of([
        {
          id: '22222222-2222-4222-a222-222222222222',
          firstName: 'Regulator2',
          lastName: 'England',
        },
      ]),
    ),
  };
  const tasksService: MockType<TasksService> = {
    processRequestTaskAction: vi.fn().mockReturnValue(of({})),
  };
  const operatorAuthoritiesService: MockType<OperatorAuthoritiesService> = {
    getAccountOperatorAuthorities: vi.fn().mockReturnValue(
      of({
        authorities: [
          {
            userId: '44444444-4444-4444-a444-444444444444',
            firstName: 'Operator4',
            lastName: 'England',
            roleName: 'Operator admin',
            roleCode: 'operator_admin',
            authorityCreationDate: '2024-08-30T15:59:37.077555Z',
            authorityStatus: 'ACTIVE',
          },
          {
            userId: '33333333-3333-4333-a333-333333333333',
            firstName: 'Operator3',
            lastName: 'England',
            roleName: 'Operator admin',
            roleCode: 'operator_admin',
            authorityCreationDate: '2024-08-30T15:59:37.077555Z',
            authorityStatus: 'ACTIVE',
          },
        ],
        editable: true,
        contactTypes: {
          PRIMARY: '33333333-3333-4333-a333-333333333333',
          SERVICE: '33333333-3333-4333-a333-333333333333',
          FINANCIAL: '44444444-4444-4444-a444-444444444444',
        },
      }),
    ),
  };
  const externalContactsService: MockType<CaExternalContactsService> = {
    getCaExternalContacts: vi.fn().mockReturnValue(
      of({
        caExternalContacts: [
          {
            id: 2,
            name: 'External1',
            email: '1@e.com',
            description: 'Some external1 contact',
            lastUpdatedDate: '2024-08-30T11:38:45.433274Z',
          },
        ],
        isEditable: true,
      }),
    ),
  };
  const tasksServiceSpy = vi.spyOn(tasksService, 'processRequestTaskAction');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OperatorAuthoritiesService, useValue: operatorAuthoritiesService },
        { provide: CaExternalContactsService, useValue: externalContactsService },
        { provide: TasksAssignmentService, useValue: tasksAssignmentService },
        // {provide: BusinessErrorService, useValue: businessErrorService},
        { provide: TasksService, useValue: tasksService },
      ],
    });
    service = TestBed.inject(NotifyUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get auto-notified operators and other operators', async () => {
    const res = await firstValueFrom(service.getAllOperatorsInfo(1));
    expect(res).toEqual({
      autoNotifiedOperators: {
        '33333333-3333-4333-a333-333333333333': {
          contactTypes: ['PRIMARY', 'SERVICE'],
          name: 'Operator3 England',
          roleCode: 'operator_admin',
        },
      },
      otherOperators: {
        '44444444-4444-4444-a444-444444444444': {
          contactTypes: ['FINANCIAL'],
          name: 'Operator4 England',
          roleCode: 'operator_admin',
        },
      },
    });
  });

  it('should get external contacts', async () => {
    const res = await firstValueFrom(service.getExternalContacts());
    expect(res).toEqual([
      {
        description: 'Some external1 contact',
        email: '1@e.com',
        id: 2,
        lastUpdatedDate: '2024-08-30T11:38:45.433274Z',
        name: 'External1',
      },
    ]);
  });

  it('should get assignees by task id', async () => {
    const res = await firstValueFrom(service.getAssignees(1));
    expect(res).toEqual([
      {
        text: 'Regulator England',
        value: '11111111-1111-4111-a111-111111111111',
      },
      {
        text: 'Regulator2 England',
        value: '22222222-2222-4222-a222-222222222222',
      },
    ]);
  });

  it('should get assignees by task type', async () => {
    const res = await firstValueFrom(
      service.getAssigneesByTaskType(
        '11111111-1111-4111-a111-111111111111',
        1,
        'EMP_NOTIFICATION_APPLICATION_PEER_REVIEW',
      ),
    );

    expect(res).toEqual([
      {
        text: 'Regulator2 England',
        value: '22222222-2222-4222-a222-222222222222',
      },
    ]);
  });

  it('should submit decision to operator', async () => {
    await firstValueFrom(
      service.submitDecisionToOperator(
        1,
        {
          operators: [],
          externalContacts: [],
          signatory: '4f22d237-28ce-44f5-9d9d-ba6848b22302',
        },
        'EMP_NOTIFICATION_NOTIFY_OPERATOR_FOR_DECISION',
        'EMP_NOTIFICATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
      ),
    );

    expect(tasksServiceSpy).toHaveBeenCalledWith({
      requestTaskActionPayload: {
        decisionNotification: {
          operators: [],
          externalContacts: [],
          signatory: '4f22d237-28ce-44f5-9d9d-ba6848b22302',
        },
        payloadType: 'EMP_NOTIFICATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
      },
      requestTaskActionType: 'EMP_NOTIFICATION_NOTIFY_OPERATOR_FOR_DECISION',
      requestTaskId: 1,
    });
  });

  it('should submit task for peer review', async () => {
    await firstValueFrom(
      service.submitForPeerReview(
        1,
        '22222222-2222-4222-a222-222222222222',
        'EMP_NOTIFICATION_REQUEST_PEER_REVIEW',
        'EMP_NOTIFICATION_REQUEST_PEER_REVIEW_PAYLOAD',
      ),
    );

    expect(tasksServiceSpy).toHaveBeenCalledWith({
      requestTaskActionPayload: {
        peerReviewer: '22222222-2222-4222-a222-222222222222',
        payloadType: 'EMP_NOTIFICATION_REQUEST_PEER_REVIEW_PAYLOAD',
      },
      requestTaskActionType: 'EMP_NOTIFICATION_REQUEST_PEER_REVIEW',
      requestTaskId: 1,
    });
  });
});
