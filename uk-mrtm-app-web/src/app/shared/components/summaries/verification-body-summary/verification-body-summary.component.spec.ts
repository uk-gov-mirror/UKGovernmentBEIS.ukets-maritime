import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { VerificationBodyCreationDTO } from '@mrtm/api';

import { ActivatedRouteStub } from '@netz/common/testing';

import { CountryService } from '@core/services';
import { CountryServiceStub } from '@registration/testing/country-service-stub';
import { VerificationBodySummaryComponent } from '@shared/components/summaries/verification-body-summary';
import { mockedVerificationBodyCreationDTO } from '@verification-bodies/testing/verification-bodies-data.mock';

@Component({
  selector: 'mrtm-test-parent',
  imports: [VerificationBodySummaryComponent],
  standalone: true,
  template: `
    <mrtm-verification-body-summary [summaryInfo]="summaryInfo" />
  `,
})
class TestParentComponent {
  summaryInfo: VerificationBodyCreationDTO = mockedVerificationBodyCreationDTO;
}

describe('VerificationBodySummaryComponent', () => {
  let component: TestParentComponent;
  let fixture: ComponentFixture<TestParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: CountryService, useClass: CountryServiceStub },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
