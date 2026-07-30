import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { of } from 'rxjs';

import { MiReportsService, RegulatorAuthoritiesService } from '@mrtm/api';

import { BasePage, MockType } from '@netz/common/testing';

import { RegulatorOutstandingRequestComponent } from '@mi-reports/components/regulator-outstanding-request/regulator-outstanding-request.component';
import { regulatorOutstandingRequestProvider } from '@mi-reports/components/regulator-outstanding-request/regulator-outstanding-request.provider';
import { MI_REPORT_FORM_GROUP } from '@mi-reports/core/mi-report.providers';

describe('RegulatorOutstandingRequestComponent', () => {
  @Component({
    imports: [ReactiveFormsModule, RegulatorOutstandingRequestComponent],
    standalone: true,
    template: `
      <form [formGroup]="formGroup()"><mrtm-regulator-outstanding-request /></form>
    `,
    providers: [regulatorOutstandingRequestProvider],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class TestComponent {
    readonly formGroup = inject(MI_REPORT_FORM_GROUP);
  }

  class Page extends BasePage<TestComponent> {
    get allInputs() {
      return this.queryAll<HTMLInputElement>('input').map((el) => el.name);
    }
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let page: Page;
  const regulatorAuthoritiesService: MockType<RegulatorAuthoritiesService> = {
    getCaRegulators: vi.fn().mockReturnValue(
      of({
        regulators: {
          caUsers: [
            {
              userId: '1reg',
              firstName: 'Alfyn',
              lastName: 'Octo',
              authorityStatus: 'DISABLED',
              authorityCreationDate: '2020-12-14T12:38:12.846716Z',
            },
          ],
          editable: true,
        },
      }),
    ),
  };

  const miReportsService: MockType<MiReportsService> = {
    getRegulatorRequestTaskTypes: vi
      .fn()
      .mockReturnValue(
        of([
          'ACCOUNT_CLOSURE_SUBMIT',
          'EMP_ISSUANCE_APPLICATION_REVIEW',
          'EMP_VARIATION_REGULATOR_LED_APPLICATION_SUBMIT',
          'EMP_NOTIFICATION_APPLICATION_PEER_REVIEW',
          'EMP_NOTIFICATION_FOLLOW_UP_APPLICATION_REVIEW',
          'EMP_VARIATION_REGULATOR_LED_APPLICATION_PEER_REVIEW',
          'EMP_VARIATION_APPLICATION_PEER_REVIEW',
          'EMP_VARIATION_APPLICATION_REVIEW',
          'EMP_ISSUANCE_APPLICATION_PEER_REVIEW',
          'EMP_NOTIFICATION_APPLICATION_REVIEW',
        ]),
      ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        { provide: MiReportsService, useValue: miReportsService },
        { provide: RegulatorAuthoritiesService, useValue: regulatorAuthoritiesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    page = new Page(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show all applicable inputs', () => {
    expect(page.query<HTMLDivElement>('div[formcontrolname=requestTaskTypes]')).toBeTruthy();
    expect(page.query<HTMLDivElement>('div[formcontrolname=userIds]')).toBeTruthy();
  });
});
