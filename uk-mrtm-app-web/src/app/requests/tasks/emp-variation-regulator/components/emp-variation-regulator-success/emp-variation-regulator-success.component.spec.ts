import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { EmpVariationRegulatorSuccessComponent } from '@requests/tasks/emp-variation-regulator/components/emp-variation-regulator-success/emp-variation-regulator-success.component';

describe('EmpVariationRegulatorSuccessComponent', () => {
  let component: EmpVariationRegulatorSuccessComponent;
  let fixture: ComponentFixture<EmpVariationRegulatorSuccessComponent>;
  let page: Page;

  class Page extends BasePage<EmpVariationRegulatorSuccessComponent> {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmpVariationRegulatorSuccessComponent],
      providers: [{ provide: ActivatedRoute, useValue: new ActivatedRouteStub() }],
    });

    fixture = TestBed.createComponent(EmpVariationRegulatorSuccessComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the task in progress texts', () => {
    expect(page.heading1.textContent.trim()).toEqual('Task in progress');
    expect(page.paragraphs.map((item) => item.textContent.trim())).toEqual([
      'The task has been completed, and the files to be submitted with your application are being created.',
      'Once the documents have been generated, the selected users will receive an email notification of your decision. The task will be removed from your task dashboard.',
      'If an error occurs while the documents are being generated, the task will remain on your task dashboard to be reviewed and submitted again.',
    ]);
    expect(page.link.textContent).toEqual('Return to: Dashboard');
  });
});
