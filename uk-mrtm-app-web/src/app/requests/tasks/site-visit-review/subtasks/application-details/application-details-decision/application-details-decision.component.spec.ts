import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { ApplicationDetailsDecisionComponent } from '@requests/tasks/site-visit-review/subtasks/application-details/application-details-decision/application-details-decision.component';

describe('ApplicationDetailsDecisionComponent', () => {
  let component: ApplicationDetailsDecisionComponent;
  let fixture: ComponentFixture<ApplicationDetailsDecisionComponent>;
  let store: RequestTaskStore;
  let page: Page;

  const route = new ActivatedRouteStub();
  const taskServiceMock: MockType<any> = {
    saveReviewDecision: vi.fn().mockReturnValue(of({})),
  };

  const mockState = {
    ...mockRequestTask,
    isEditable: true,
    requestTaskItem: {
      ...mockRequestTask.requestTaskItem,
      requestInfo: {
        ...mockRequestTask.requestTaskItem.requestInfo,
        requestMetadata: { year: 2025, type: 'SITE_VISIT' },
      },
      requestTask: {
        ...mockRequestTask.requestTaskItem.requestTask,
        type: 'SITE_VISIT_APPLICATION_REVIEW',
        payload: {
          payloadType: 'SITE_VISIT_APPLICATION_REVIEW_PAYLOAD',
          year: 2025,
          siteVisit: { applicationDetails: { files: [], clarification: null } },
          siteVisitAttachments: {},
          sectionsCompleted: {},
          reviewDecision: null,
          reviewAttachments: {},
        },
      },
    },
  };

  class Page extends BasePage<ApplicationDetailsDecisionComponent> {
    get radioButtons(): HTMLInputElement[] {
      return this.queryAll<HTMLInputElement>('input[type="radio"]');
    }

    get addAnotherButton(): HTMLButtonElement | undefined {
      return this.queryAll<HTMLButtonElement>('button[type="button"]').find((btn) =>
        btn.textContent?.includes('Add another required change'),
      );
    }

    get requiredChangeItems(): HTMLElement[] {
      return this.queryAll<HTMLElement>('[id^="required-changes-"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(ApplicationDetailsDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationDetailsDecisionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskServiceMock },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(mockState);
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when submitted without selecting a decision type', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents).toContain('Select a decision');
  });

  it('should show error when submitted without an overall decision summary', () => {
    page.radioButtons[0].click();
    fixture.detectChanges();
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents).toContain('Enter a summary');
  });

  it('should show one required change field by default when OPERATOR_AMENDS_NEEDED is selected', () => {
    const amendsNeededRadio = page.radioButtons.find((r: HTMLInputElement) => r.value === 'OPERATOR_AMENDS_NEEDED');
    amendsNeededRadio?.click();
    fixture.detectChanges();

    expect(page.requiredChangeItems.length).toBe(1);
  });

  it('should add another required change field when Add button is clicked', () => {
    const amendsNeededRadio = page.radioButtons.find((r: HTMLInputElement) => r.value === 'OPERATOR_AMENDS_NEEDED');
    amendsNeededRadio?.click();
    fixture.detectChanges();

    page.addAnotherButton?.click();
    fixture.detectChanges();

    expect(component.requiredChangesCtrl.length).toBe(2);
  });

  it('should call saveReviewDecision on valid form submit', () => {
    page.radioButtons[0].click();
    fixture.detectChanges();
    component.form.controls.summary.setValue('Overall decision summary');
    fixture.detectChanges();

    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceMock.saveReviewDecision).toHaveBeenCalled();
  });
});
