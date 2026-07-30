import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of, throwError } from 'rxjs';

import { OperatorAuthoritiesService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ErrorCodes } from '@netz/common/error';
import {
  ActivatedRouteStub,
  BasePage,
  BusinessErrorStubComponent,
  expectBusinessErrorToBe,
  mockClass,
  MockType,
} from '@netz/common/testing';

import { DeleteUserAuthorityComponent } from '@accounts/containers/delete-user-authority/delete-user-authority';
import { saveNotFoundOperatorError } from '@accounts/errors';
import { mockOperatorDTO } from '@accounts/testing/accounts-data.mock';
import { AuthService } from '@core/services/auth.service';

describe('DeleteComponent', () => {
  let component: DeleteUserAuthorityComponent;
  let fixture: ComponentFixture<DeleteUserAuthorityComponent>;
  let page: Page;
  let authStore: AuthStore;

  class Page extends BasePage<DeleteUserAuthorityComponent> {
    get confirmButton() {
      return this.query<HTMLButtonElement>('button');
    }

    get link() {
      return this.query<HTMLAnchorElement>('a');
    }

    get panel() {
      return this.query<HTMLElement>('govuk-panel');
    }
  }

  const authService: MockType<AuthService> = {
    loadUserState: vi.fn(),
  };
  const operatorAuthoritiesService = mockClass(OperatorAuthoritiesService);
  const route = new ActivatedRouteStub({ accountId: '123', userId: 'test1' }, undefined, {
    userAuthority: { ...mockOperatorDTO, userId: 'test1' },
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideRouter([{ path: 'error/business', component: BusinessErrorStubComponent }]),
        { provide: AuthService, useValue: authService },
        { provide: OperatorAuthoritiesService, useValue: operatorAuthoritiesService },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();

    authStore = TestBed.inject(AuthStore);
    authStore.setUserState({ userId: 'test1' });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteUserAuthorityComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  afterEach(() => vi.clearAllMocks());

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should delete self and point to dashboard', () => {
    operatorAuthoritiesService.deleteCurrentUserAccountOperatorAuthority.mockReturnValueOnce(of(null));
    authService.loadUserState.mockReturnValueOnce(of(null));
    page.confirmButton.click();
    fixture.detectChanges();
    expect(page.link.textContent.trim()).toEqual('Return to: Dashboard');
    expect(page.link.href).toMatch(/\/landing$/);
  });

  it('should delete self and point to welcome page', () => {
    operatorAuthoritiesService.deleteCurrentUserAccountOperatorAuthority.mockReturnValueOnce(of(null));
    authService.loadUserState.mockReturnValueOnce(of(null));
    authStore.setUserState({ userId: 'test1' });
    page.confirmButton.click();
    fixture.detectChanges();

    expect(page.link.textContent.trim()).toEqual('Return to: Dashboard');
    expect(page.link.href).not.toMatch(/\/dashboard$/);
  });

  it('should delete other user and point back to the list', () => {
    operatorAuthoritiesService.deleteCurrentUserAccountOperatorAuthority.mockReturnValueOnce(of(null));
    operatorAuthoritiesService.deleteAccountOperatorAuthority.mockReturnValueOnce(of(null));
    authService.loadUserState.mockReturnValueOnce(of(null));
    authStore.setUserState({ userId: 'test2' });
    page.confirmButton.click();
    fixture.detectChanges();

    expect(page.link.textContent.trim()).toEqual(`Return to: Users, contacts and verifiers page`);
    expect(page.link.href).not.toMatch(/\/dashboard$/);
  });

  it('should navigate to save error when deleting an already deleted user', async () => {
    operatorAuthoritiesService.deleteCurrentUserAccountOperatorAuthority.mockReturnValueOnce(of(null));
    operatorAuthoritiesService.deleteAccountOperatorAuthority.mockReturnValueOnce(
      throwError(() => new HttpErrorResponse({ status: 400, error: { code: ErrorCodes.AUTHORITY1004 } })),
    );
    authService.loadUserState.mockReturnValueOnce(of(null));
    authStore.setUserState({ userId: 'test2' });
    page.confirmButton.click();
    fixture.detectChanges();

    await expectBusinessErrorToBe(saveNotFoundOperatorError(123));
  });
});
