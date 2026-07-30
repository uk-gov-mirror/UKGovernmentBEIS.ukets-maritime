import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { firstValueFrom, of } from 'rxjs';

import { MaritimeAccountsService, MaritimeAccountUpdateService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { DestroySubject, PendingRequestService } from '@netz/common/services';
import { mockClass } from '@netz/common/testing';

import { CreateOperatorAccountGuard } from '@accounts/guards/create-operator-account.guard';
import { OperatorAccountsStore } from '@accounts/store';
import { mockAuthService } from '@core/guards/core-guards.mock';
import { AuthService } from '@core/services/auth.service';

let guard: CreateOperatorAccountGuard;

describe('CreateOperatorAccountGuard -> canActivate', () => {
  let authStore: AuthStore;
  const pendingRequestService = mockClass(PendingRequestService);

  mockAuthService.checkUser.mockReturnValue(of(void 0));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DestroySubject,
        OperatorAccountsStore,
        CreateOperatorAccountGuard,
        { provide: PendingRequestService, useValue: pendingRequestService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MaritimeAccountsService, useValue: mockClass(MaritimeAccountsService) },
        { provide: MaritimeAccountUpdateService, useValue: mockClass(MaritimeAccountUpdateService) },
      ],
    });

    authStore = TestBed.inject(AuthStore);
    guard = TestBed.inject(CreateOperatorAccountGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow only for regulators', async () => {
    authStore.setUserState({ roleType: 'REGULATOR' });
    const allowReg = await firstValueFrom(guard.canActivate());
    expect(allowReg).toEqual(true);

    authStore.setUserState({ roleType: 'OPERATOR' });
    const allowOp = await firstValueFrom(guard.canActivate());
    expect(allowOp).toEqual(false);
  });
});

describe('CreateAviationAccountGuard -> canDeactivate', () => {
  const pendingRequestService = mockClass(PendingRequestService);
  const store: Partial<OperatorAccountsStore> = {
    resetCreateAccount: vi.fn(),
  };

  mockAuthService.checkUser.mockReturnValue(of(void 0));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        DestroySubject,
        CreateOperatorAccountGuard,
        { provide: OperatorAccountsStore, useValue: store },
        { provide: PendingRequestService, useValue: pendingRequestService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    guard = TestBed.inject(CreateOperatorAccountGuard);
  });

  it('should reset store and destroy form on deactivate', () => {
    const resetSpy = vi.spyOn(store, 'resetCreateAccount');
    guard.canDeactivate();
    expect(resetSpy).toHaveBeenCalled();
  });
});
