import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';

import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { SendForPeerReviewComponent } from '@requests/common/components/peer-review/send-for-peer-review/send-for-peer-review.component';
import { taskProviders } from '@requests/common/task.providers';
import { NotifyUsersService } from '@shared/services';

describe('SendForPeerReviewComponent', () => {
  let component: SendForPeerReviewComponent;
  let fixture: ComponentFixture<SendForPeerReviewComponent>;
  let page: Page;
  let store: RequestTaskStore;
  let router: Router;

  const route = new ActivatedRouteStub();
  const notifyUsersService: MockType<NotifyUsersService> = {
    getAssigneesByTaskType: vi.fn().mockReturnValue(
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
    submitForPeerReview: vi.fn().mockReturnValue(of({})),
  };
  const notifyUsersServiceSpy = vi.spyOn(notifyUsersService, 'submitForPeerReview');

  class Page extends BasePage<SendForPeerReviewComponent> {
    set assignees(value: string) {
      this.setInputValue('select', value);
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(SendForPeerReviewComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendForPeerReviewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: NotifyUsersService, useValue: notifyUsersService },
        provideHttpClient(),
        ...taskProviders,
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  describe('for new peer review', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState({
        ...mockRequestTask,
        requestTaskItem: {
          ...mockRequestTask.requestTaskItem,
          requestTask: {
            ...mockRequestTask.requestTaskItem.requestTask,
            type: 'EMP_ISSUANCE_APPLICATION_REVIEW',
            payload: {
              payloadType: 'EMP_NOTIFICATION_APPLICATION_REVIEW_PAYLOAD',
            },
          },
        },
      });
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Send for peer review');
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(1);
      expect(page.errorSummaryListContents).toEqual(['Select a peer reviewer']);
    });
  });

  describe('for existing peer review', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState({
        ...mockRequestTask,
        requestTaskItem: {
          ...mockRequestTask.requestTaskItem,
          requestTask: {
            ...mockRequestTask.requestTaskItem.requestTask,
            type: 'EMP_ISSUANCE_APPLICATION_REVIEW',
            payload: {
              payloadType: 'EMP_NOTIFICATION_APPLICATION_REVIEW_PAYLOAD',
            },
          },
        },
      });
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Send for peer review');
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      page.assignees = '22222222-2222-4222-a222-222222222222';
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(notifyUsersServiceSpy).toHaveBeenCalledWith(
        mockRequestTask.requestTaskItem.requestTask.id,
        '22222222-2222-4222-a222-222222222222',
        'EMP_ISSUANCE_REQUEST_PEER_REVIEW',
        'EMP_ISSUANCE_REQUEST_PEER_REVIEW_PAYLOAD',
      );

      expect(navigateSpy).toHaveBeenCalledWith(['success'], {
        relativeTo: route,
        state: {
          assignedTo: 'Regulator2 England',
        },
        skipLocationChange: true,
      });
    });
  });
});
