import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { RequestDetailsSearchResults, RequestMetadata, RequestsService } from '@mrtm/api';

import { ActivatedRouteStub, BasePage, mockClass } from '@netz/common/testing';

import { ReportsTabComponent } from '@accounts/components';
import { OperatorAccountsStore } from '@accounts/store';
import { mockedAccount } from '@accounts/testing/accounts-data.mock';

export const mockWorkflowResults: RequestDetailsSearchResults = {
  requestDetails: [
    {
      id: 'DOE00004-2024-1',
      requestType: 'DOE',
      requestStatus: 'IN_PROGRESS',
      creationDate: '2025-02-27',
      requestMetadata: {
        type: 'DOE',
        year: '2024',
        exempted: false,
      } as RequestMetadata,
    },
    {
      id: 'DOE00004-2023-1',
      requestType: 'DOE',
      requestStatus: 'COMPLETED',
      creationDate: '2025-02-27',
      requestMetadata: {
        type: 'DOE',
        year: '2023',
        exempted: false,
      } as RequestMetadata,
    },
    {
      id: 'MAR00004-2023',
      requestType: 'AER',
      requestStatus: 'IN_PROGRESS',
      creationDate: '2025-02-18',
      requestMetadata: {
        type: 'AER',
        year: '2023',
        initiatorRequest: {
          requestType: 'AER',
        },
        exempted: false,
      } as RequestMetadata,
    },
  ],
  total: 3,
};

describe('ReportsTabComponent', () => {
  let component: ReportsTabComponent;
  let fixture: ComponentFixture<ReportsTabComponent>;
  let page: Page;
  let store: OperatorAccountsStore;

  const activatedRouteStub = new ActivatedRouteStub({ accountId: mockedAccount.account.id });
  const requestsService = mockClass(RequestsService);
  requestsService.getRequestDetailsByResource.mockReturnValue(of(mockWorkflowResults as any));

  class Page extends BasePage<ReportsTabComponent> {
    get heading() {
      return this.query('h2');
    }

    get aerTypeCheckbox() {
      return this.query<HTMLInputElement>('input#requestTypes-0');
    }

    get completedStatusCheckbox() {
      return this.query<HTMLInputElement>('input#requestStatuses-2');
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

    fixture = TestBed.createComponent(ReportsTabComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(page.heading.textContent.trim()).toEqual('Reports');
  });

  it('should filter results upon clicking on different checkboxes', async () => {
    page.aerTypeCheckbox.click();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    expect(requestsService.getRequestDetailsByResource).toHaveBeenCalledTimes(1);
    expect(requestsService.getRequestDetailsByResource).toHaveBeenLastCalledWith({
      resourceType: 'ACCOUNT',
      resourceId: String(mockedAccount.account.id),
      historyCategory: 'REPORTING',
      requestTypes: ['AER'],
      requestStatuses: [],
      pageNumber: 0,
      pageSize: 10000,
    });

    page.completedStatusCheckbox.click();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    expect(requestsService.getRequestDetailsByResource).toHaveBeenCalledTimes(2);
    expect(requestsService.getRequestDetailsByResource).toHaveBeenLastCalledWith({
      resourceType: 'ACCOUNT',
      resourceId: String(mockedAccount.account.id),
      historyCategory: 'REPORTING',
      requestTypes: ['AER'],
      requestStatuses: ['CANCELLED'],
      pageNumber: 0,
      pageSize: 10000,
    });
  });
});
