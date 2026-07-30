import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { RequestDetailsSearchResults, RequestsService } from '@mrtm/api';

import { ActivatedRouteStub, BasePage, mockClass } from '@netz/common/testing';

import { NonComplianceTabComponent } from '@accounts/components';
import { OperatorAccountsStore } from '@accounts/store';
import { mockedAccount } from '@accounts/testing/accounts-data.mock';

export const mockWorkflowResults: RequestDetailsSearchResults = {
  requestDetails: [
    {
      id: '1',
      requestType: 'NON_COMPLIANCE',
      requestStatus: 'IN_PROGRESS',
      creationDate: new Date('2022-12-12').toISOString(),
    },
    {
      id: '2',
      requestType: 'NON_COMPLIANCE',
      requestStatus: 'COMPLETED',
      creationDate: new Date('2022-12-11').toISOString(),
    },
  ],
  total: 2,
};

describe('NonComplianceHistoryTabComponent', () => {
  let component: NonComplianceTabComponent;
  let fixture: ComponentFixture<NonComplianceTabComponent>;
  let page: Page;
  let store: OperatorAccountsStore;

  const activatedRouteStub = new ActivatedRouteStub({ accountId: mockedAccount.account.id });
  const requestsService = mockClass(RequestsService);
  requestsService.getRequestDetailsByResource.mockReturnValue(of(mockWorkflowResults as any));

  class Page extends BasePage<NonComplianceTabComponent> {
    get heading() {
      return this.query('h2');
    }

    get typeCheckbox() {
      return this.query<HTMLInputElement>('input#requestTypes-0');
    }

    get completedStatusCheckbox() {
      return this.query<HTMLInputElement>('input#requestStatuses-1');
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RequestsService, useValue: requestsService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();

    store = TestBed.inject(OperatorAccountsStore);
    store.setCurrentAccount(mockedAccount);

    // The form streams use `debounceTime(0)` (RxJS asyncScheduler -> setInterval) and the filter
    // tests flush it with `setTimeout`. Fake the timer functions so no real Node timer is ever
    // created (which would trip detectAsyncLeaks); advance them explicitly to fire the debounce.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });

    fixture = TestBed.createComponent(NonComplianceTabComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(page.heading.textContent.trim()).toEqual('Non-compliance');
  });

  it('should filter results upon clicking on different checkboxes', async () => {
    page.typeCheckbox.click();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    expect(requestsService.getRequestDetailsByResource).toHaveBeenCalledTimes(1);
    expect(requestsService.getRequestDetailsByResource).toHaveBeenLastCalledWith({
      resourceType: 'ACCOUNT',
      resourceId: String(mockedAccount.account.id),
      historyCategory: 'NON_COMPLIANCE',
      requestTypes: ['NON_COMPLIANCE'],
      requestStatuses: [],
      pageNumber: 0,
      pageSize: 30,
    });

    page.completedStatusCheckbox.click();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    expect(requestsService.getRequestDetailsByResource).toHaveBeenCalledTimes(2);
    expect(requestsService.getRequestDetailsByResource).toHaveBeenLastCalledWith({
      resourceType: 'ACCOUNT',
      resourceId: String(mockedAccount.account.id),
      historyCategory: 'NON_COMPLIANCE',
      requestTypes: ['NON_COMPLIANCE'],
      requestStatuses: ['COMPLETED'],
      pageNumber: 0,
      pageSize: 30,
    });
  });
});
