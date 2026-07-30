import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { VariationDetailsSummaryFormComponent } from '@requests/common/emp/subtasks/variation-details/variation-details-summary-form/variation-details-summary-form.component';
import { taskProviders } from '@requests/common/task.providers';

describe('VariationDetailsSummaryFormComponent', () => {
  class Page extends BasePage<VariationDetailsSummaryFormComponent> {}
  let component: VariationDetailsSummaryFormComponent;
  let fixture: ComponentFixture<VariationDetailsSummaryFormComponent>;
  let page: Page;

  const taskServiceMock: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariationDetailsSummaryFormComponent],
      providers: [
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: TaskService, useValue: taskServiceMock },
        ...taskProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VariationDetailsSummaryFormComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Expect to display all HTML elements', () => {
    expect(page.heading1.textContent).toEqual(
      'Enter a summary of the changes for emissions monitoring plan variation log',
    );
    expect(page.errorSummary).toBeFalsy();
  });

  it('Should display correct validations', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents).toEqual(['Enter a summary']);
  });

  it('should submit form', () => {
    page.setInputValue('#summary', 'Test value');
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceMock.saveSubtask).toHaveBeenCalled();
  });
});
