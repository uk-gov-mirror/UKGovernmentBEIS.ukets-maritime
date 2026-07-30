import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule, UrlSegment } from '@angular/router';

import { firstValueFrom, of } from 'rxjs';

import { MaritimeAccountsService } from '@mrtm/api';

import { DestroySubject } from '@netz/common/services';
import { ActivatedRouteStub, RouterStubComponent } from '@netz/common/testing';

import { CreateOperatorAccountSummaryComponent } from '@accounts/containers/create-operator-account-summary/create-operator-account-summary.component';
import { OperatorAccountsStore, selectIsSubmitted } from '@accounts/store';

describe('CreateOperatorAccountSummaryComponent', () => {
  let component: CreateOperatorAccountSummaryComponent;
  let fixture: ComponentFixture<CreateOperatorAccountSummaryComponent>;
  let store: OperatorAccountsStore;

  const accountsService: Partial<MaritimeAccountsService> = {
    createMaritimeAccount: vi.fn().mockReturnValue(of({ res: 200 })),
  };
  const route = new ActivatedRouteStub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateOperatorAccountSummaryComponent,
        RouterModule.forRoot([
          {
            path: 'success',
            pathMatch: 'full',
            component: RouterStubComponent,
          },
          {
            path: 'summary',
            pathMatch: 'full',
            component: CreateOperatorAccountSummaryComponent,
          },
        ]),
      ],
      providers: [
        provideHttpClient(),
        OperatorAccountsStore,
        DestroySubject,
        { provide: MaritimeAccountsService, useValue: accountsService },
        { provide: ActivatedRoute, useValue: route },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    const router = TestBed.inject(Router);

    route.setUrl([new UrlSegment('summary', {})]);

    fixture = TestBed.createComponent(CreateOperatorAccountSummaryComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(OperatorAccountsStore);

    await router.navigate(['summary']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call createAccount and set IsSubmitted in store when submitting the form', async () => {
    component.handleSubmit();
    await fixture.whenStable();
    const is = await firstValueFrom(store.pipe(selectIsSubmitted));
    expect(is).toEqual(true);
    expect(accountsService.createMaritimeAccount).toHaveBeenCalled();
  });
});
