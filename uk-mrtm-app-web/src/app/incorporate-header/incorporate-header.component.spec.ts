import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { MaritimeAccountsService, MrtmAccountEmpDTO } from '@mrtm/api';

import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, mockClass } from '@netz/common/testing';

import { OperatorAccountsStore } from '@accounts/store';
import { IncorporateHeaderComponent } from '@incorporate-header/incorporate-header.component';

describe('IncorporateHeaderComponent', () => {
  let component: IncorporateHeaderComponent;
  let fixture: ComponentFixture<IncorporateHeaderComponent>;
  const maritimeAccountsService = mockClass(MaritimeAccountsService);
  let requestTaskStore: RequestTaskStore;
  const activatedRoute = new ActivatedRouteStub();

  const mockAccountDetails: MrtmAccountEmpDTO = {
    account: {
      id: 2,
      name: 'name',
      state: 'state',
      city: 'city',
      firstMaritimeActivityDate: new Date('2022-02-02').toISOString(),
      imoNumber: '1231231',
      line1: 'line1',
      line2: 'line2',
      country: 'country',
      postcode: 'postcode',
      status: 'NEW',
    },
    emp: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncorporateHeaderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MaritimeAccountsService, useValue: maritimeAccountsService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    requestTaskStore = TestBed.inject(RequestTaskStore);
    fixture = TestBed.createComponent(IncorporateHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display content if account details available', () => {
    maritimeAccountsService.getMaritimeAccount = vi.fn().mockReturnValue(of(mockAccountDetails));
    requestTaskStore.setRequestTaskItem({
      requestInfo: {
        resourceType: 'ACCOUNT',
        resources: {
          ACCOUNT: '1',
        },
      },
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.govuk-phase-banner'))).toBeTruthy();
  });

  it('should hide content if account details not available', () => {
    maritimeAccountsService.getMaritimeAccount.mockReturnValue(of(null));
    requestTaskStore.setRequestTaskItem({
      requestInfo: {
        resourceType: 'ACCOUNT',
        resources: {
          ACCOUNT: '1',
        },
      },
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.govuk-phase-banner'))).toBeFalsy();
  });

  it('should hide emp-id and account-status section if emp info not available', () => {
    maritimeAccountsService.getMaritimeAccount = vi.fn().mockReturnValue(of(mockAccountDetails));
    requestTaskStore.setRequestTaskItem({
      requestInfo: {
        resourceType: 'ACCOUNT',
        resources: {
          ACCOUNT: '1',
        },
      },
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('span'))).toBeFalsy();
    expect((fixture.debugElement.nativeElement as Element).textContent).not.toContain('Emissions Plan ID:');
  });

  it('should reuse the account already loaded in the store instead of fetching it again', () => {
    maritimeAccountsService.getMaritimeAccount = vi.fn().mockReturnValue(of(mockAccountDetails));
    TestBed.inject(OperatorAccountsStore).setCurrentAccount(mockAccountDetails);
    fixture.detectChanges();

    expect(maritimeAccountsService.getMaritimeAccount).not.toHaveBeenCalled();
    expect((fixture.debugElement.query(By.css('.govuk-phase-banner')).nativeElement as Element).textContent).toContain(
      'name',
    );
  });

  it('should display emp-id and account-status section if emp info available', () => {
    maritimeAccountsService.getMaritimeAccount = vi.fn().mockReturnValue(
      of({
        ...mockAccountDetails,
        emp: {
          id: '1234',
        },
      }),
    );
    requestTaskStore.setRequestTaskItem({
      requestInfo: {
        resourceType: 'ACCOUNT',
        resources: {
          ACCOUNT: '1',
        },
      },
    });
    fixture.detectChanges();
    const additionalInfoEl = fixture.debugElement.query(By.css('span'));
    expect(additionalInfoEl).toBeTruthy();
    expect((additionalInfoEl.nativeElement as Element).textContent).toContain('Emissions Plan ID:');
    expect((additionalInfoEl.nativeElement as Element).textContent).toContain('1234');
    expect((additionalInfoEl.nativeElement as Element).textContent).toContain('New');
  });
});
