import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { BasePage } from '@netz/common/testing';

import { provideAerAggregatedEmissionsFormGroup } from '@requests/common/aer/components';
import { AerAggregatedEmissionsFormComponent } from '@requests/common/aer/components/aer-aggregated-emissions-form/aer-aggregated-emissions-form.component';

describe('AerAggregatedEmissionsFormComponent', () => {
  @Component({
    imports: [ReactiveFormsModule, AerAggregatedEmissionsFormComponent],
    standalone: true,
    template: `
      <form [formGroup]="formGroup"><mrtm-aer-aggregated-emissions-form formGroupName="testGroup" /></form>
    `,
  })
  class TestComponent {
    formGroup: FormGroup = new FormGroup({
      testGroup: provideAerAggregatedEmissionsFormGroup(),
    });
  }

  class Page extends BasePage<TestComponent> {}

  let page: Page;
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
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
    expect(page.queryAll('input')).toHaveLength(3);
    expect(page.queryAll('label').map((x) => x.textContent?.trim())).toEqual([
      'CO2 emissions (t)',
      'CH4 emissions (tCO2e)',
      'N2O emissions (tCO2e)',
    ]);

    expect(page.paragraphs.at(0)?.textContent?.trim()).toEqual('Total emissions (tCO2e)');
    expect(page.paragraphs.at(1).textContent?.trim()).toEqual('Not calculated yet');
  });

  it('should calculate total emissions', async () => {
    page.setInputValue('#testGroup.co2', '12');
    page.setInputValue('#testGroup.ch4', '12');
    page.setInputValue('#testGroup.n2o', '12');

    await new Promise((resolve) => setTimeout(resolve, 1000));
    fixture.detectChanges();

    expect(page.paragraphs.at(1).textContent?.trim()).toEqual('36');
  });
});
