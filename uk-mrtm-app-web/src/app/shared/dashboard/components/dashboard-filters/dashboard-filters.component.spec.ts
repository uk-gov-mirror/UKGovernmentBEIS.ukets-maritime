import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardStore } from '@shared/dashboard/+store';
import { DashboardFiltersComponent } from '@shared/dashboard/components/dashboard-filters/dashboard-filters.component';

describe('DashboardFiltersComponent', () => {
  let component: DashboardFiltersComponent;
  let fixture: ComponentFixture<DashboardFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardFiltersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep the filters panel open when there are applied filters', async () => {
    const details = fixture.nativeElement.querySelector('details');
    expect(details.open).toBe(false);

    TestBed.inject(DashboardStore).setFilters({ accountId: null, workflowType: 'AER', orderBy: 'NEWEST_FIRST' });
    await fixture.whenStable();

    expect(details.open).toBe(true);
  });
});
