import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ActivatedRouteStub } from '@netz/common/testing';

import { OperatorAccountReportingDetailsComponent } from '@accounts/components';
import { OperatorAccountsStore } from '@accounts/store';
import { mockedAccount } from '@accounts/testing/accounts-data.mock';

describe('OperatorAccountReportingDetailsComponent', () => {
  let component: OperatorAccountReportingDetailsComponent;
  let fixture: ComponentFixture<OperatorAccountReportingDetailsComponent>;
  let store: OperatorAccountsStore;
  const activatedRoute = new ActivatedRouteStub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorAccountReportingDetailsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OperatorAccountsStore,
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorAccountReportingDetailsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(OperatorAccountsStore);
    store.setCurrentAccount(mockedAccount);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
