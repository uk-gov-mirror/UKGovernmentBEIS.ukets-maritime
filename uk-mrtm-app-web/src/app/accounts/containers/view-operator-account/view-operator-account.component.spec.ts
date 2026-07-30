import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MaritimeAccountsService, MaritimeAccountUpdateService } from '@mrtm/api';

import { DestroySubject } from '@netz/common/services';
import { ActivatedRouteStub, mockClass } from '@netz/common/testing';

import { ViewOperatorAccountComponent } from '@accounts/containers';
import { OperatorAccountsStore } from '@accounts/store';
import { mockedAccount } from '@accounts/testing/accounts-data.mock';

describe('ViewOperatorAccountComponent', () => {
  let component: ViewOperatorAccountComponent;
  let fixture: ComponentFixture<ViewOperatorAccountComponent>;
  let store: OperatorAccountsStore;
  const activatedRoute = new ActivatedRouteStub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule, ViewOperatorAccountComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OperatorAccountsStore,
        { provide: MaritimeAccountsService, useValue: mockClass(MaritimeAccountsService) },
        { provide: MaritimeAccountUpdateService, useValue: mockClass(MaritimeAccountUpdateService) },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: DestroySubject },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewOperatorAccountComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(OperatorAccountsStore);
    store.setCurrentAccount(mockedAccount);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
