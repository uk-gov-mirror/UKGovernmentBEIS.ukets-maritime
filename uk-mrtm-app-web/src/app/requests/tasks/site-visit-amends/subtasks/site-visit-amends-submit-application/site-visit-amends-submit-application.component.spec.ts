import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { BasePage, MockType } from '@netz/common/testing';

import { SiteVisitCommonTaskPayload } from '@requests/common/site-visit/site-visit-common.types';
import { taskProviders } from '@requests/common/task.providers';
import { SiteVisitAmendsSubmitApplicationComponent } from '@requests/tasks/site-visit-amends/subtasks/site-visit-amends-submit-application/site-visit-amends-submit-application.component';

describe('SiteVisitAmendsSubmitApplicationComponent', () => {
  let component: SiteVisitAmendsSubmitApplicationComponent;
  let fixture: ComponentFixture<SiteVisitAmendsSubmitApplicationComponent>;
  let store: RequestTaskStore;
  let page: Page;

  const taskServiceMock: MockType<TaskService<any>> = {
    submit: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskServiceMock, 'submit');

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
        type: 'SITE_VISIT_APPLICATION_AMEND',
        payload: {
          payloadType: 'SITE_VISIT_APPLICATION_AMEND_PAYLOAD',
          year: 2025,
          siteVisit: { applicationDetails: { files: [], clarification: null } },
          siteVisitAttachments: {},
          sectionsCompleted: {},
        } as SiteVisitCommonTaskPayload,
      },
    },
  };

  class Page extends BasePage<SiteVisitAmendsSubmitApplicationComponent> {
    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(SiteVisitAmendsSubmitApplicationComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteVisitAmendsSubmitApplicationComponent],
      providers: [provideRouter([]), { provide: TaskService, useValue: taskServiceMock }, ...taskProviders],
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

  it('should display heading and reporting year before submission', () => {
    expect(page.heading1.textContent.trim()).toBe('Send application to regulator');
    expect(page.summariesContents).toEqual(['Reporting Year', '2025']);
    expect(page.submitButton.textContent.trim()).toBe('Confirm and send');
  });

  it('should call taskService.submit and navigate to the success page on confirm', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['success'], expect.objectContaining({ skipLocationChange: true }));
  });
});
