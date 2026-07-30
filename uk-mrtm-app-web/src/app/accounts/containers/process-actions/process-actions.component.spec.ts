import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import {
  ItemDTOResponse,
  RequestCreateActionProcessResponseDTO,
  RequestCreateValidationResult,
  RequestItemsService,
  RequestsService,
  UserStateDTO,
} from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ActivatedRouteStub, BasePage, mockClass, RouterStubComponent } from '@netz/common/testing';

import { ProcessActionsComponent } from '@accounts/containers';
import { MrtmRequestType } from '@shared/types';

describe('ProcessActionsComponent', () => {
  let component: ProcessActionsComponent;
  let fixture: ComponentFixture<ProcessActionsComponent>;
  let authStore: AuthStore;
  let router: Router;
  let page: Page;

  const mockAccountId = '1';
  const activatedRouteStub = new ActivatedRouteStub({ accountId: mockAccountId });
  const taskId = 1;
  const processRequestCreateActionResponse: RequestCreateActionProcessResponseDTO = { requestId: '1234' };
  const requestService = mockClass(RequestsService);
  const requestItemsService = mockClass(RequestItemsService);

  const createRequestPayload = (requestType) => ({
    requestType: requestType,
    requestCreateActionPayload: {
      payloadType: 'EMPTY_PAYLOAD',
    },
  });

  const createComponent = async () => {
    fixture = TestBed.createComponent(ProcessActionsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  };

  const createModule = async (
    roleType: UserStateDTO['roleType'],
    mockedWorkflows?: Partial<Record<MrtmRequestType, RequestCreateValidationResult>>,
  ) => {
    requestService.processRequestCreateAction = vi.fn().mockReturnValue(of(processRequestCreateActionResponse));
    requestService.getAvailableWorkflows = vi.fn().mockReturnValue(of(mockedWorkflows ?? {}));
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'dashboard', component: RouterStubComponent },
          { path: `tasks/${taskId}`, component: RouterStubComponent },
        ]),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: RequestsService, useValue: requestService },
        { provide: RequestItemsService, useValue: requestItemsService },
      ],
    }).compileComponents();
    authStore = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
    authStore.setUserState({
      ...authStore.state.userState,
      roleType,
      userId: 'opTestId',
      status: 'ENABLED',
    });
    await createComponent();
  };

  class Page extends BasePage<ProcessActionsComponent> {
    get buttons() {
      return this.queryAll<HTMLButtonElement>('button');
    }

    get buttonContents(): string[] {
      return this.buttons.map((item) => item.textContent.trim());
    }

    get noAvailableTaskContents(): string[] {
      return this.queryAll<HTMLLIElement>('.govuk-list > li').map((item) => item.textContent.trim());
    }

    get errorListContents(): string[] {
      return this.queryAll<HTMLLIElement>('.govuk-grid-column-full > .govuk-list > li').map((item) =>
        item.textContent.trim(),
      );
    }
  }

  describe('for regulator', () => {
    it('should create', async () => {
      await createModule('REGULATOR');
      expect(component).toBeTruthy();
    });

    it('should retrieve available workflows and display them as expected', async () => {
      await createModule('REGULATOR', {
        ACCOUNT_CLOSURE: { valid: true },
      });

      fixture.detectChanges();
      expect(page.buttonContents).toEqual(['Start to close this account']);
      expect(page.errorListContents).toEqual([]);
    });

    it('should retrieve available workflows and display error when another process is in progress', async () => {
      await createModule('REGULATOR', {
        ACCOUNT_CLOSURE: { valid: false, requests: ['UNDEFINED'] },
      });

      expect(page.buttonContents).toEqual([]);
      expect(page.errorListContents).toEqual([
        'You cannot start the account closure process while the undefined is in progress.',
      ]);
    });

    it('should retrieve available workflows and display message when no tasks are available', async () => {
      await createModule('OPERATOR');

      expect(page.buttonContents).toEqual([]);
      expect(page.noAvailableTaskContents).toEqual(['There are no available processes to initiate.']);
    });

    it('should retrieve available workflows and display message account is not ENABLED', async () => {
      await createModule('REGULATOR', {
        ACCOUNT_CLOSURE: {
          accountStatus: 'CLOSED',
        } as RequestCreateValidationResult,
      });

      const lastListElement = page.noAvailableTaskContents.length - 1;
      expect(page.buttonContents).toEqual([]);
      expect(page.noAvailableTaskContents[lastListElement]).toEqual(
        'You cannot start the account closure while the account status is CLOSED.',
      );
    });

    it('should processRequestCreateAction, navigate to the task item page, when a single Task Item is received', async () => {
      const expectedRequestType = 'ACCOUNT_CLOSURE';
      const getItemsResponse: ItemDTOResponse = { items: [{ requestType: expectedRequestType, taskId }] };
      requestItemsService.getItemsByRequest = vi.fn().mockReturnValueOnce(of(getItemsResponse));
      await createModule('REGULATOR', { ACCOUNT_CLOSURE: { valid: true } });

      const onRequestButtonClickSpy = vi.spyOn(component, 'onRequestButtonClick');
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      page.buttons[0].click();

      expect(onRequestButtonClickSpy).toHaveBeenCalledTimes(1);
      expect(onRequestButtonClickSpy).toHaveBeenCalledWith(expectedRequestType);

      expect(requestService.processRequestCreateAction).toHaveBeenCalledTimes(1);
      expect(requestService.processRequestCreateAction).toHaveBeenCalledWith(
        createRequestPayload(expectedRequestType),
        mockAccountId,
      );

      expect(requestItemsService.getItemsByRequest).toHaveBeenCalledTimes(1);
      expect(requestItemsService.getItemsByRequest).toHaveBeenCalledWith(processRequestCreateActionResponse.requestId);

      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenCalledWith(['/tasks', 1]);
    });

    it('should processRequestCreateAction, navigate to dashboard, when multiple or 0 task Items are received', async () => {
      requestItemsService.getItemsByRequest = vi.fn().mockReturnValueOnce(of({ items: [] }));
      await createModule('REGULATOR', { ACCOUNT_CLOSURE: { valid: true } });

      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      page.buttons[0].click();
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenLastCalledWith(['/dashboard']);

      requestItemsService.getItemsByRequest = vi.fn().mockReturnValueOnce(
        of({
          items: [
            { requestType: 'NOTIFICATION_OF_COMPLIANCE_P3', taskId: taskId },
            { requestType: 'NOTIFICATION_OF_COMPLIANCE_P3', taskId: taskId + 1 },
          ],
        }),
      );
      page.buttons[0].click();
      expect(navigateSpy).toHaveBeenCalledTimes(2);
      expect(navigateSpy).toHaveBeenLastCalledWith(['/dashboard']);
    });
  });
});
