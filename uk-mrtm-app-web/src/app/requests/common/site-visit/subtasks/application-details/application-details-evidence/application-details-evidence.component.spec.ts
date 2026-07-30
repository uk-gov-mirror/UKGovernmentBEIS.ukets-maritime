import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { SiteVisitCommonTaskPayload } from '@requests/common/site-visit/site-visit-common.types';
import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
} from '@requests/common/site-visit/subtasks/application-details';
import { ApplicationDetailsEvidenceComponent } from '@requests/common/site-visit/subtasks/application-details/application-details-evidence';
import { taskProviders } from '@requests/common/task.providers';

describe('ApplicationDetailsEvidenceComponent', () => {
  let component: ApplicationDetailsEvidenceComponent;
  let fixture: ComponentFixture<ApplicationDetailsEvidenceComponent>;
  let store: RequestTaskStore;
  let page: Page;

  const route = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskServiceMock, 'saveSubtask');

  const mockSiteVisitState = {
    ...mockRequestTask,
    requestTaskItem: {
      ...mockRequestTask.requestTaskItem,
      requestInfo: {
        ...mockRequestTask.requestTaskItem.requestInfo,
        requestMetadata: { year: 2025, type: 'SITE_VISIT' },
      },
      requestTask: {
        ...mockRequestTask.requestTaskItem.requestTask,
        type: 'SITE_VISIT_APPLICATION_SUBMIT',
        payload: {
          payloadType: 'SITE_VISIT_APPLICATION_SAVE_PAYLOAD',
          year: 2025,
          siteVisit: {
            applicationDetails: {
              files: [],
              clarification: null,
            },
          },
          siteVisitAttachments: {},
          sectionsCompleted: {},
        } as SiteVisitCommonTaskPayload,
      },
    },
  };

  class Page extends BasePage<ApplicationDetailsEvidenceComponent> {
    get reportingYear(): string {
      return this.query<HTMLElement>('dl dd').textContent.trim();
    }

    get clarification(): string {
      return this.getInputValue<string>('textarea');
    }

    set clarification(value: string) {
      this.setInputValue('textarea', value);
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(ApplicationDetailsEvidenceComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationDetailsEvidenceComponent],
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
    store.setState(mockSiteVisitState);
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display heading and reporting year from store', () => {
    expect(page.heading1.textContent.trim()).toBe('Upload evidence for a virtual site visit application');
    expect(page.reportingYear).toBe('2025');
  });

  it('should show error on empty form submit', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents).toEqual(['Upload supporting files']);
  });

  it('should call saveSubtask on valid form submit', () => {
    const uploadedFile = [{ uuid: 'uuid-1', file: new File(['content'], 'evidence.pdf') }];
    component.formGroup.controls.files.setValue(uploadedFile);
    page.clarification = 'Some notes';
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeFalsy();
    expect(taskServiceSpy).toHaveBeenCalledWith(
      APPLICATION_DETAILS_SUBTASK,
      ApplicationDetailsWizardSteps.EVIDENCE,
      route,
      { files: uploadedFile, clarification: 'Some notes' },
    );
  });
});
