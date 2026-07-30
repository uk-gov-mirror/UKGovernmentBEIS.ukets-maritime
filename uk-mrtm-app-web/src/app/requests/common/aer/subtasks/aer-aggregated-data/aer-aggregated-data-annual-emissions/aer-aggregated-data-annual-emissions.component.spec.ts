import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { AerAggregatedDataAnnualEmissionsComponent } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data-annual-emissions/aer-aggregated-data-annual-emissions.component';
import { taskProviders } from '@requests/common/task.providers';
describe('AerAggregatedDataAnnualEmissionsComponent', () => {
  class Page extends BasePage<AerAggregatedDataAnnualEmissionsComponent> {}

  let component: AerAggregatedDataAnnualEmissionsComponent;
  let fixture: ComponentFixture<AerAggregatedDataAnnualEmissionsComponent>;
  let page: Page;

  const routeMock: ActivatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<unknown>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskServiceMock, 'saveSubtask');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AerAggregatedDataAnnualEmissionsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: TaskService, useValue: taskServiceMock },
        ...taskProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AerAggregatedDataAnnualEmissionsComponent);
    page = new Page(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements and form with 0 errors', () => {
    expect(page.errorSummary).toBeFalsy();
    expect(page.heading1).toBeTruthy();
    expect(page.heading1.textContent).toEqual('Annual aggregated emissions');
    expect(page.heading2.textContent.trim()).toEqual('Total aggregated greenhouse gas emitted');
    expect(page.queryAll('fieldset>legend').map((item) => item.textContent.trim())).toEqual([
      'Aggregated greenhouse gas emissions which occurred within UK ports',
      'Aggregated greenhouse gas emissions from all voyages between UK ports',
      'Aggregated greenhouse gas emissions from all voyages between Great Britain and Northern Ireland',
    ]);

    expect(page.submitButton).toBeTruthy();
    expect(page.query('a').textContent).toEqual('Return to: Aggregated data for ships');
  });

  it('should display error on empty form submit', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents.length).toEqual(3);

    expect(page.errorSummaryListContents).toEqual([
      'Enter aggregated greenhouse gas emissions from all voyages between Great Britain and Northern Ireland',
      'Enter the aggregated greenhouse gas emissions from all voyages between UK ports',
      'Enter aggregated greenhouse gas emissions which occurred within UK ports',
    ]);

    expect(taskServiceSpy).not.toHaveBeenCalled();
  });

  it('should display error for invalid data', () => {
    page.setInputValue('input[name="emissionsWithinUKPorts.co2"]', 'testIncorrectValue');
    page.setInputValue('input[name="emissionsWithinUKPorts.ch4"]', '0.12332125');
    page.setInputValue('input[name="emissionsWithinUKPorts.n2o"]', '-10');

    fixture.componentInstance.onCalculationValueChanged('emissionsWithinUKPorts');

    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummaryListContents).toEqual(
      expect.arrayContaining(['Must accept only positive numbers or zero', 'Enter a number up to 7 decimal places']),
    );

    expect(taskServiceSpy).not.toHaveBeenCalled();
  });
});
