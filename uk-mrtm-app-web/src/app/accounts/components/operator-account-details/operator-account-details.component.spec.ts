import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ActivatedRouteStub } from '@netz/common/testing';

import { OperatorAccountDetailsComponent } from '@accounts/components';
import { OperatorAccountsStore } from '@accounts/store';
import { mockedAccount } from '@accounts/testing/accounts-data.mock';

describe('OperatorAccountDetailsComponent', () => {
  let component: OperatorAccountDetailsComponent;
  let fixture: ComponentFixture<OperatorAccountDetailsComponent>;
  let store: OperatorAccountsStore;
  const activatedRoute = new ActivatedRouteStub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorAccountDetailsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OperatorAccountsStore,
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorAccountDetailsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(OperatorAccountsStore);
    store.setCurrentAccount(mockedAccount);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
