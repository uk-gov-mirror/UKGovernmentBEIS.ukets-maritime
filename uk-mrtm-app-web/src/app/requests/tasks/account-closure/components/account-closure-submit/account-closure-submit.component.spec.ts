import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { AccountClosureSubmitRequestTaskPayload } from '@mrtm/api';

import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { AccountClosureSubmitComponent } from '@requests/tasks/account-closure/components';
import { AccountClosureStateService } from '@requests/tasks/account-closure/services';

describe('AccountClosureSubmitComponent', () => {
  let component: AccountClosureSubmitComponent;
  let fixture: ComponentFixture<AccountClosureSubmitComponent>;
  let page: Page;
  let router: Router;

  const activatedRoute = new ActivatedRouteStub({ accountId: 1 });
  const accountClosureStateService: MockType<AccountClosureStateService> = {
    saveAccountClosure: vi.fn().mockReturnValue(of(null)),
  };
  const accountClosureExistingStateService: MockType<AccountClosureStateService> = {
    saveAccountClosure: vi.fn().mockReturnValue(of(null)),
    get payload(): AccountClosureSubmitRequestTaskPayload {
      return { accountClosure: { reason: 'Test' } };
    },
  };

  class Page extends BasePage<AccountClosureSubmitComponent> {
    get reason() {
      return this.getInputValue('#reason');
    }

    set reason(value: string) {
      this.setInputValue('#reason', value);
    }
  }

  describe('for new account closure details', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [AccountClosureSubmitComponent],
        providers: [
          provideRouter([]),
          provideHttpClient(),
          { provide: AccountClosureStateService, useValue: accountClosureStateService },
          { provide: ActivatedRoute, useValue: activatedRoute },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(AccountClosureSubmitComponent);
      component = fixture.componentInstance;
      page = new Page(fixture);
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    beforeEach(() => {});

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(component).toBeTruthy();
      expect(page.errorSummary).toBeFalsy();
      expect(page.submitButton).toBeTruthy;
    });

    it('should display all HTMLElements and form with errors', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents).toEqual(['You must say why you are closing this account']);
    });

    it('should submit a valid form and navigate to nextRoute', () => {
      const taskServiceSpy = vi.spyOn(accountClosureStateService, 'saveAccountClosure');
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      page.reason = 'Test reason';
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith({
        accountClosure: {
          reason: 'Test reason',
        },
      });
      expect(navigateSpy).toHaveBeenCalledWith(['account-closure', 'confirmation'], { relativeTo: activatedRoute });
    });
  });

  describe('for existing account closure details', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [AccountClosureSubmitComponent],
        providers: [
          provideRouter([]),
          provideHttpClient(),
          { provide: AccountClosureStateService, useValue: accountClosureExistingStateService },
          { provide: ActivatedRoute, useValue: activatedRoute },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(AccountClosureSubmitComponent);
      component = fixture.componentInstance;
      page = new Page(fixture);
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    it('should submit a valid form and navigate to nextRoute', () => {
      const taskServiceSpy = vi.spyOn(accountClosureExistingStateService, 'saveAccountClosure');
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      expect(page.reason).toEqual('Test');
      expect(page.errorSummary).toBeFalsy();

      page.reason = 'Test changed';
      page.submitButton.click();
      fixture.detectChanges();

      expect(taskServiceSpy).toHaveBeenCalledWith({
        accountClosure: {
          reason: 'Test changed',
        },
      });
      expect(navigateSpy).toHaveBeenCalledWith(['account-closure', 'confirmation'], { relativeTo: activatedRoute });
    });
  });
});
