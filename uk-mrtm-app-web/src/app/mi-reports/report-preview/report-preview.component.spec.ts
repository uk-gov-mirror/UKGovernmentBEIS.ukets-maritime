import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { MiReportsService } from '@mrtm/api';

import { ActivatedRouteStub, BasePage, mockClass } from '@netz/common/testing';

import { miReportTypeDescriptionMap } from '@mi-reports/core/mi-report';
import { MiReportType } from '@mi-reports/core/mi-report-type.enum';
import { ReportPreviewComponent } from '@mi-reports/report-preview';
import { MI_REPORT_USE_CASE_SERVICE } from '@mi-reports/use-cases/common';
import { ListOfAccountsUseCaseService } from '@mi-reports/use-cases/list-of-accounts-use-case.service';

describe('ReportPreviewComponent', () => {
  let component: ReportPreviewComponent;
  let fixture: ComponentFixture<ReportPreviewComponent>;
  let page: Page;

  const miReportsService = mockClass(MiReportsService);
  const routeStub = new ActivatedRouteStub();
  routeStub.snapshot.queryParams = {};

  class Page extends BasePage<ReportPreviewComponent> {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPreviewComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: MiReportsService, useValue: miReportsService },
        { provide: MI_REPORT_USE_CASE_SERVICE, useClass: ListOfAccountsUseCaseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportPreviewComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display HTML Elements', () => {
    expect(page.heading1.textContent).toEqual(miReportTypeDescriptionMap[MiReportType.LIST_OF_ACCOUNTS_USERS_CONTACTS]);
    expect(page.queryAll('button').map((item) => item.textContent)).toEqual(['Execute', 'Export to excel']);
  });
});
