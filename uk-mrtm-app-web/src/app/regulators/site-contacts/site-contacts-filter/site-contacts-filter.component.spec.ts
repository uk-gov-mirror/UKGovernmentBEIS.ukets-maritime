import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { MaritimeAccountsService } from '@mrtm/api';

import { ActivatedRouteStub, asyncData, MockType } from '@netz/common/testing';

import { initialSiteContactsFiltersState, selectFilters, SiteContactsStore } from '@regulators/site-contacts/+store';
import {
  ALL_ACCOUNTS_VALUE,
  SiteContactsFilterComponent,
} from '@regulators/site-contacts/site-contacts-filter/site-contacts-filter.component';

describe('SiteContactsFilterComponent', () => {
  let component: SiteContactsFilterComponent;
  let fixture: ComponentFixture<SiteContactsFilterComponent>;
  let store: SiteContactsStore;

  const maritimeAccountsService: MockType<MaritimeAccountsService> = {
    getMrtmAccountsInfoByUser: vi.fn().mockReturnValue(
      asyncData([
        { id: 1, name: 'Operator 1', businessId: 'MA0001' },
        { id: 2, name: 'Operator 2', businessId: 'MA0002' },
      ]),
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteContactsFilterComponent],
      providers: [
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: MaritimeAccountsService, useValue: maritimeAccountsService },
      ],
    }).compileComponents();

    store = TestBed.inject(SiteContactsStore);
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(SiteContactsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should store the selected account on submit', () => {
    createComponent();

    component.formGroup.setValue({ filterByAccount: { data: 'MA0002', text: 'Operator 2 (ID: MA0002)' } });

    component.onSubmit();

    expect(store.select(selectFilters)()).toEqual({ businessId: { data: 'MA0002', text: 'Operator 2 (ID: MA0002)' } });
  });

  it('should store an empty filter when submitting without a selection', () => {
    createComponent();

    component.onSubmit();

    expect(store.select(selectFilters)()).toEqual({ businessId: null });
  });

  it('should reset the form and store an empty filter on clear', () => {
    createComponent();

    component.formGroup.setValue({ filterByAccount: { data: 'MA0001', text: 'Operator 1 (ID: MA0001)' } });
    component.onSubmit();

    component.onClearFiltersClick();

    expect(component.formGroup.value).toEqual({ filterByAccount: ALL_ACCOUNTS_VALUE });
    expect(store.select(selectFilters)()).toEqual(initialSiteContactsFiltersState);
  });

  it('should initialize the form from the stored filters', () => {
    store.setFilters({ businessId: { data: 'MA0001', text: 'Operator 1 (ID: MA0001)' } });

    createComponent();

    expect(component.formGroup.value).toEqual({
      filterByAccount: { data: 'MA0001', text: 'Operator 1 (ID: MA0001)' },
    });
  });
});
