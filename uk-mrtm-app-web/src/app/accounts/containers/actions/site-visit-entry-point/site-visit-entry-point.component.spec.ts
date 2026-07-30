import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { ItemDTOResponse, RequestCreateValidationResult, RequestItemsService, RequestsService } from '@mrtm/api';

import { ITEM_LINK_REQUEST_TYPES_WHITELIST, ItemLinkPipe } from '@netz/common/pipes';
import { PendingRequestService } from '@netz/common/services';
import { BasePage, mockClass, RouterStubComponent } from '@netz/common/testing';

import { SiteVisitEntryPointComponent } from '@accounts/containers/actions';
import { OperatorAccountsStore } from '@accounts/store';
import { requestTypesWhitelistForItemLinkPipe } from '@shared/constants';

describe('SiteVisitEntryPointComponent', () => {
  let component: SiteVisitEntryPointComponent;
  let fixture: ComponentFixture<SiteVisitEntryPointComponent>;
  let router: Router;
  let page: Page;

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const mockAccountId = 1;
  const requestId = 'request-123';
  const taskId = 42;

  const requestsService = mockClass(RequestsService);
  const requestItemsService = mockClass(RequestItemsService);

  const mockWorkflows = (workflows: Record<string, Partial<RequestCreateValidationResult>>) =>
    requestsService.getAvailableSiteVisitWorkflows.mockReturnValue(of(workflows) as any);

  class Page extends BasePage<SiteVisitEntryPointComponent> {
    get radioLabels(): string[] {
      return this.queryAll<HTMLLabelElement>('.govuk-radios__label').map((l) => l.textContent.trim());
    }

    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="submit"]');
    }
  }

  beforeEach(async () => {
    requestsService.processRequestCreateAction = vi.fn().mockReturnValue(of({ requestId }));
    requestsService.getAvailableSiteVisitWorkflows = vi.fn().mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [SiteVisitEntryPointComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'tasks/:taskId', component: RouterStubComponent },
          { path: 'dashboard', component: RouterStubComponent },
        ]),
        OperatorAccountsStore,
        PendingRequestService,
        { provide: RequestsService, useValue: requestsService },
        { provide: RequestItemsService, useValue: requestItemsService },
        { provide: ITEM_LINK_REQUEST_TYPES_WHITELIST, useValue: requestTypesWhitelistForItemLinkPipe },
        ItemLinkPipe,
      ],
    }).compileComponents();

    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(SiteVisitEntryPointComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('accountId', mockAccountId);
    page = new Page(fixture);
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should request the available site visit workflows for the given account', () => {
    fixture.detectChanges();

    expect(requestsService.getAvailableSiteVisitWorkflows).toHaveBeenCalledWith(mockAccountId);
  });

  it('should render nothing and skip the request when no account id is provided', () => {
    fixture.componentRef.setInput('accountId', undefined);
    fixture.detectChanges();

    expect(requestsService.getAvailableSiteVisitWorkflows).not.toHaveBeenCalled();
    expect(page.radioLabels).toEqual([]);
    expect(page.submitButton).toBeNull();
  });

  it('should still request workflows when account id is 0', () => {
    fixture.componentRef.setInput('accountId', 0);
    fixture.detectChanges();

    expect(requestsService.getAvailableSiteVisitWorkflows).toHaveBeenCalledWith(0);
  });

  it('should display only the years marked valid as radio options', () => {
    mockWorkflows({
      [currentYear]: { valid: true },
      [previousYear]: { valid: false },
    });
    fixture.detectChanges();

    expect(page.radioLabels).toEqual([currentYear.toString()]);
  });

  it('should display no year options when none are valid', () => {
    mockWorkflows({
      [currentYear]: { valid: false },
      [previousYear]: { valid: false },
    });
    fixture.detectChanges();

    expect(page.radioLabels).toEqual([]);
  });

  it('should display no year options when the response is empty', () => {
    mockWorkflows({});
    fixture.detectChanges();

    expect(page.radioLabels).toEqual([]);
  });

  it('should treat a year with no valid flag as invalid', () => {
    mockWorkflows({ [currentYear]: {} });
    fixture.detectChanges();

    expect(page.radioLabels).toEqual([]);
  });

  it('should display both years when both are valid, most recent year first', () => {
    mockWorkflows({
      [previousYear]: { valid: true },
      [currentYear]: { valid: true },
    });
    fixture.detectChanges();

    expect(page.radioLabels).toEqual([currentYear.toString(), previousYear.toString()]);
  });

  it('should call processRequestCreateAction on submit and navigate to task when single item returned', () => {
    const getItemsResponse: ItemDTOResponse = { items: [{ requestType: 'ACCOUNT_CLOSURE', taskId }] };
    requestItemsService.getItemsByRequest = vi.fn().mockReturnValue(of(getItemsResponse));

    mockWorkflows({ [currentYear]: { valid: true } });
    fixture.detectChanges();

    const navigateSpy = vi.spyOn(router, 'navigate');
    component.formGroup.controls.year.setValue(currentYear);

    page.submitButton.click();

    expect(requestsService.processRequestCreateAction).toHaveBeenCalledWith(
      {
        requestType: 'SITE_VISIT',
        requestCreateActionPayload: { payloadType: 'SITE_VISIT_REQUEST_CREATE_ACTION_PAYLOAD', year: currentYear },
      },
      mockAccountId.toString(),
    );
    expect(requestItemsService.getItemsByRequest).toHaveBeenCalledWith(requestId);
    expect(navigateSpy).toHaveBeenCalledWith(['/tasks', taskId]);
  });

  it('should navigate to dashboard when multiple or no items are returned', () => {
    requestItemsService.getItemsByRequest = vi.fn().mockReturnValue(of({ items: [] }));

    mockWorkflows({ [currentYear]: { valid: true } });
    fixture.detectChanges();

    const navigateSpy = vi.spyOn(router, 'navigate');
    component.formGroup.controls.year.setValue(currentYear);
    page.submitButton.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);

    requestItemsService.getItemsByRequest = vi.fn().mockReturnValue(
      of({
        items: [
          { requestType: 'ACCOUNT_CLOSURE', taskId },
          { requestType: 'ACCOUNT_CLOSURE', taskId: taskId + 1 },
        ],
      }),
    );
    page.submitButton.click();
    expect(navigateSpy).toHaveBeenLastCalledWith(['/dashboard']);
  });
});
