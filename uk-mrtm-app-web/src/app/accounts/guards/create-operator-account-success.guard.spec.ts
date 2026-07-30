import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { firstValueFrom } from 'rxjs';

import { MaritimeAccountsService, MaritimeAccountUpdateService } from '@mrtm/api';

import { mockClass } from '@netz/common/testing';

import { CreateOperatorAccountSuccessGuard } from '@accounts/guards/create-operator-account-success.guard';
import { OperatorAccountsStore } from '@accounts/store';

describe('CreateOperatorAccountSuccessGuard', () => {
  let guard: CreateOperatorAccountSuccessGuard;
  let store: OperatorAccountsStore;
  const router = mockClass(Router);

  beforeEach(() => {
    router.parseUrl.mockReturnValue(new UrlTree());

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OperatorAccountsStore,
        CreateOperatorAccountSuccessGuard,
        { provide: MaritimeAccountsService, useValue: mockClass(MaritimeAccountsService) },
        { provide: MaritimeAccountUpdateService, useValue: mockClass(MaritimeAccountUpdateService) },
        { provide: Router, useValue: router },
      ],
    });

    guard = TestBed.inject(CreateOperatorAccountSuccessGuard);
    store = TestBed.inject(OperatorAccountsStore);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow route when form is submitted', async () => {
    store.setIsInitiallySubmitted(true);
    store.setIsSubmitted(true);
    store.setNewAccount(null);

    const val = await firstValueFrom(guard.canActivate());
    expect(val).toBe(true);
  });

  it('should redirect to account form when is initially submitted', async () => {
    store.setIsInitiallySubmitted(true);
    store.setIsSubmitted(false);
    store.setNewAccount({
      name: 'TEST',
      imoNumber: '1234567',
      line1: 'TEST',
      city: 'TEST',
      country: 'TEST',
      firstMaritimeActivityDate: 'TEST',
    });

    const val = await firstValueFrom(guard.canActivate());
    expect(router.parseUrl).toHaveBeenCalledWith('/accounts/create');
    expect(val).toBeInstanceOf(UrlTree);
  });

  it('should redirect to dashboard when no submission', async () => {
    store.setIsInitiallySubmitted(false);
    store.setIsSubmitted(false);
    store.setNewAccount(null);

    const val = await firstValueFrom(guard.canActivate());
    expect(router.parseUrl).toHaveBeenCalledWith('/dashboard');
    expect(val).toBeInstanceOf(UrlTree);
  });
});
