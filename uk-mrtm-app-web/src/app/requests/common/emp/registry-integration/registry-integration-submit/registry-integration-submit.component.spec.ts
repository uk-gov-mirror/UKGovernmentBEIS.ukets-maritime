import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { MaritimeAccountsService, MrtmAccountEmpDTO } from '@mrtm/api';

import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { OperatorAccountsStore } from '@accounts/store';
import { CountryService } from '@core/services';
import { RegistryIntegrationSubmitComponent } from '@requests/common/emp/registry-integration/registry-integration-submit';
import { RegistryIntegrationApiService } from '@requests/common/emp/registry-integration/services';
import { taskProviders } from '@requests/common/task.providers';

describe('RegistryIntegrationSubmitComponent', () => {
  let component: RegistryIntegrationSubmitComponent;
  let fixture: ComponentFixture<RegistryIntegrationSubmitComponent>;
  let page: Page;
  let store: RequestTaskStore;
  let operatorStore: OperatorAccountsStore;

  const mockAccountDetails: MrtmAccountEmpDTO = {
    account: {
      imoNumber: '1111117',
      name: 'OperatorAccount7',
      line1: 'Some address',
      city: 'London',
      country: 'GB',
      postcode: 'HY56 BS73',
      state: 'Cardiff',
      firstMaritimeActivityDate: new Date('2026-01-01').toISOString(),
      id: 7,
      status: 'NEW',
      businessId: 'MA00007',
      competentAuthority: 'ENGLAND',
    },
  };

  const mockReviewPayload = {
    payloadType: 'EMP_ISSUANCE_APPLICATION_REVIEW_PAYLOAD',
    sendEmailNotification: true,
    emissionsMonitoringPlan: {
      operatorDetails: {
        operatorName: 'OperatorAccount7',
        imoNumber: '1111117',
        contactAddress: {
          line1: 'Some address',
          city: 'London',
          country: 'GB',
          postcode: '54639',
        },
        organisationStructure: {
          legalStatusType: 'LIMITED_COMPANY',
          registeredAddress: {
            line1: 'Some address',
            city: 'London',
            country: 'GB',
            postcode: 'HY43 ST90',
            state: 'Cardiff',
          },
          registrationNumber: '11111111',
          evidenceFiles: ['41291b0a-d7fb-4e70-8485-f01c0a632212'],
        },
        declarationDocuments: {
          exist: false,
        },
        activityDescription: 'asdf',
      },
    },
    accountOpeningEventSentToRegistry: true,
  };

  const mockEmpReviewRequestTask = {
    ...mockRequestTask,
    requestTaskItem: {
      ...mockRequestTask.requestTaskItem,
      requestTask: {
        ...mockRequestTask.requestTaskItem.requestTask,
        payload: mockReviewPayload,
      },
    },
  };

  const route = new ActivatedRouteStub();
  const registryIntegrationApiService: MockType<RegistryIntegrationApiService> = {
    submit: vi.fn().mockReturnValue(of({})),
  };

  const taskServiceSpy = vi.spyOn(registryIntegrationApiService, 'submit');
  const mrtmAccountsService: MockType<MaritimeAccountsService> = {
    getMaritimeAccount: vi.fn().mockReturnValue(of(mockAccountDetails)),
  };
  const countryService: MockType<CountryService> = {
    getCountry: vi.fn().mockReturnValue(
      of({
        code: 'CY',
        name: 'Cyprus',
        officialName: 'Cyprus',
      }),
    ),
  };

  class Page extends BasePage<RegistryIntegrationSubmitComponent> {
    get continueButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button');
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistryIntegrationSubmitComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: RegistryIntegrationApiService, useValue: registryIntegrationApiService },
        { provide: CountryService, useValue: countryService },
        { provide: MaritimeAccountsService, useValue: mrtmAccountsService },
        ...taskProviders,
      ],
    }).compileComponents();

    store = TestBed.inject(RequestTaskStore);
    operatorStore = TestBed.inject(OperatorAccountsStore);
    store.setState(mockEmpReviewRequestTask);
    operatorStore.setCurrentAccount(mockAccountDetails);

    fixture = TestBed.createComponent(RegistryIntegrationSubmitComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Emitter ID',
      'MA00007',
      'Company IMO Number',
      '1111117',
      'Operator name',
      'OperatorAccount7',
      'First year of reporting obligation',
      '1 Jan 2026',
      'Regulator',
      'Environment Agency',
      'Organisation legal status',
      'Company',
      'Company registration number',
      '11111111',
      'Registered address',
      'Some addressLondonCardiffHY43 ST90Cyprus',
    ]);
  });

  it(`should submit task`, () => {
    page.continueButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledTimes(1);
  });
});
