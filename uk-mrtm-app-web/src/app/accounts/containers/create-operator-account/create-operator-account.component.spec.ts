import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';

import { firstValueFrom, of } from 'rxjs';

import { MaritimeAccountsService, MaritimeAccountUpdateService } from '@mrtm/api';

import { DestroySubject, PendingRequestService } from '@netz/common/services';
import { ActivatedRouteStub, BasePage, mockClass } from '@netz/common/testing';

import { CreateOperatorAccountComponent } from '@accounts/containers/create-operator-account/create-operator-account.component';
import { OperatorAccountsStore, selectIsInitiallySubmitted, selectNewAccount } from '@accounts/store';
import { ConfigStore } from '@core/config';

describe('CreateOperatorAccountComponent', () => {
  class Page extends BasePage<CreateOperatorAccountComponent> {
    get submitButton() {
      return this.query<HTMLButtonElement>('button[type="submit"]');
    }
  }

  let component: CreateOperatorAccountComponent;
  let page: Page;
  let fixture: ComponentFixture<CreateOperatorAccountComponent>;
  let router: Router;
  let store: OperatorAccountsStore;
  let configStore: ConfigStore;

  const account = {
    imoNumber: '1234567',
    name: 'TESTNAME',
    line1: 'TEST_LINE1',
    line2: 'TEST_LINE2',
    city: 'TEST_CITY',
    country: 'TEST_COUNTRY',
    postcode: 'TEST_POSTCODE',
    state: 'TEST_STATE',
    firstMaritimeActivityDate: new Date('2024-05-29T00:00:00.000Z'),
  };

  const accountsService = mockClass(MaritimeAccountsService);
  const route = new ActivatedRouteStub();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CreateOperatorAccountComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PendingRequestService,
        OperatorAccountsStore,
        DestroySubject,
        { provide: MaritimeAccountsService, useValue: accountsService },
        { provide: MaritimeAccountUpdateService, useValue: mockClass(MaritimeAccountUpdateService) },
        { provide: ActivatedRoute, useValue: route },
      ],
    });
    configStore = TestBed.inject(ConfigStore);
    configStore.setState({
      properties: { minYearOfFirstMrtmActivity: '2020' },
    });
    store = TestBed.inject(OperatorAccountsStore);
    router = TestBed.inject(Router);
    route.setUrl([new UrlSegment('/', {})]);
    fixture = TestBed.createComponent(CreateOperatorAccountComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set newAccount and isInitiallySubmitted in store when submitting the form', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    accountsService.isExistingAccountImoNumber.mockReturnValue(of(false) as any);
    component.form.setValue(account);
    page.submitButton.click();
    fixture.detectChanges();

    const iis = await firstValueFrom(store.pipe(selectIsInitiallySubmitted));
    const na = await firstValueFrom(store.pipe(selectNewAccount));
    expect(iis).toEqual(true);
    expect(na).toEqual(account);
    expect(navigateSpy).toHaveBeenCalledWith(['summary'], { relativeTo: route });
  });

  it('should show error for existed imo number', () => {
    const handleConfirmSpy = vi.spyOn(component, 'handleConfirm');
    accountsService.isExistingAccountImoNumber.mockReturnValue(of(true) as any);
    component.form.setValue(account);
    page.submitButton.click();
    fixture.detectChanges();

    expect(handleConfirmSpy).toHaveBeenCalledTimes(0);
    expect(component.form.controls['imoNumber'].errors).toEqual({
      imoNumber: 'Enter a different company IMO number. This one is already in use',
    });
  });
});
