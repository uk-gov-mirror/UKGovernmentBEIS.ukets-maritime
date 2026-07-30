import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { EmpNotificationReviewDecision, RequestTaskPayload } from '@mrtm/api';

import { mockRequestTask, mockRequestTaskStateBuild } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType, RouterStubComponent } from '@netz/common/testing';

import { NotifyOperatorFormComponent } from '@requests/common/components/notify-operator/notify-operator-form/notify-operator-form.component';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { NotifyUsersService } from '@shared/services';

describe('NotifyOperatorFormComponent', () => {
  let component: NotifyOperatorFormComponent;
  let fixture: ComponentFixture<NotifyOperatorFormComponent>;
  let page: Page;
  let store: RequestTaskStore;
  let router: Router;

  const route = new ActivatedRouteStub({});
  const notifyUsersService: MockType<NotifyUsersService> = {
    getAllOperatorsInfo: vi.fn().mockReturnValue(
      of({
        autoNotifiedOperators: {
          '33333333-3333-4333-a333-333333333333': {
            contactTypes: ['PRIMARY', 'SERVICE', 'FINANCIAL'],
            name: 'Operator3 England',
            roleCode: 'operator_admin',
          },
        },
        otherOperators: {
          '44444444-4444-4444-a444-444444444444': {
            contactTypes: ['SECONDARY'],
            name: 'Operator4 England',
            roleCode: 'operator_admin',
          },
        },
      }),
    ),
    getExternalContacts: vi.fn().mockReturnValue(
      of([
        {
          id: 5,
          name: 'External1',
          email: '1@e.com',
          description: 'Some external1 contact',
          lastUpdatedDate: '2024-08-30T11:38:45.433274Z',
        },
      ]),
    ),
    getAssignees: vi.fn().mockReturnValue(
      of([
        {
          text: 'Regulator England',
          value: '11111111-1111-4111-a111-111111111111',
        },
        {
          text: 'Regulator2 England',
          value: '22222222-2222-4222-a222-222222222222',
        },
      ]),
    ),
    submitDecisionToOperator: vi.fn().mockReturnValue(of({})),
  };
  const notifyUsersServiceSpy = vi.spyOn(notifyUsersService, 'submitDecisionToOperator');

  class Page extends BasePage<NotifyOperatorFormComponent> {
    get headingsOrLabels(): HTMLHeadingElement[] | HTMLLegendElement[] {
      return this.queryAll<HTMLHeadingElement | HTMLLegendElement>('h2, legend, [govuk-select] label');
    }

    set signatory(value: string) {
      this.setInputValue('select', value);
    }

    get otherOperatorsCheckboxes() {
      return this.queryAll<HTMLInputElement>('#operators .govuk-checkboxes__input');
    }

    get otherOperatorsCheckboxLabels() {
      return this.queryAll<HTMLInputElement>('#operators .govuk-checkboxes__label');
    }

    get externalCheckboxes() {
      return this.queryAll<HTMLInputElement>('#externalContacts .govuk-checkboxes__input');
    }

    get externalCheckboxLabels() {
      return this.queryAll<HTMLInputElement>('#externalContacts .govuk-checkboxes__label');
    }
  }

  const createComponent = () => {
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(NotifyOperatorFormComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotifyOperatorFormComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: NotifyUsersService, useValue: notifyUsersService },
        provideRouter([
          {
            path: 'success',
            component: RouterStubComponent,
          },
        ]),
        provideHttpClient(),
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new notify operator', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Select who should receive the notification letter');
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(1);
      expect(page.errorSummaryListContents).toEqual(['Select a name to appear on the official notice document.']);
    });
  });

  describe('for existing notify operator', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(
        mockRequestTaskStateBuild({
          payloadType: 'EMP_NOTIFICATION_APPLICATION_REVIEW_PAYLOAD',
          reviewDecision: {
            type: 'ACCEPTED',
            details: {
              followUp: {
                followUpResponseRequired: true,
                followUpRequest: 'some followup request',
                followUpResponseExpirationDate: new Date('2050-10-31') as unknown as string,
              },
              officialNotice: 'some summary',
              notes: 'some notes',
            },
          } as EmpNotificationReviewDecision,
          sectionsCompleted: { detailsChange: TaskItemStatus.IN_PROGRESS },
        } as RequestTaskPayload),
      );
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Select who should receive the notification letter');
      expect(page.headingsOrLabels.map((item) => item.textContent.trim())).toEqual([
        'Users automatically notified',
        'Select any additional users you want to notify',
        'Select the external contacts you want to notify',
        'Select the name and signature that will be shown on the notification letter',
      ]);
      expect(page.otherOperatorsCheckboxLabels.map((item) => item.textContent.trim())).toEqual([
        'Operator4 England, Operator admin - Secondary contact',
      ]);
      expect(page.externalCheckboxLabels.map((item) => item.textContent.trim())).toEqual(['1@e.com']);
      expect(page.submitButton).toBeTruthy();
    });

    it('should display specific headings for emp variation', () => {
      store.setRequestTaskItem({
        requestTask: {
          type: 'EMP_VARIATION_REGULATOR_LED_APPLICATION_SUBMIT',
        },
      });
      fixture.detectChanges();
      expect(page.heading1.textContent).toEqual('Select who should receive documents');
      expect(page.headingsOrLabels.map((item) => item.textContent.trim())).toEqual([
        'Users that automatically receive documents',
        'Select other users',
        'Select the external contacts',
        'Select the name and signature that will be shown on the documents',
      ]);
    });

    it(`should edit and submit a valid form`, async () => {
      const routerSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      page.otherOperatorsCheckboxes[0].click();
      page.externalCheckboxes[0].click();
      page.signatory = '22222222-2222-4222-a222-222222222222';
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(notifyUsersServiceSpy).toHaveBeenCalledWith(
        mockRequestTask.requestTaskItem.requestTask.id,
        {
          operators: ['44444444-4444-4444-a444-444444444444'],
          externalContacts: ['5'],
          signatory: '22222222-2222-4222-a222-222222222222',
        },
        'EMP_NOTIFICATION_NOTIFY_OPERATOR_FOR_DECISION',
        'EMP_NOTIFICATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
      );

      expect(routerSpy).toHaveBeenCalledTimes(1);
    });
  });
});
