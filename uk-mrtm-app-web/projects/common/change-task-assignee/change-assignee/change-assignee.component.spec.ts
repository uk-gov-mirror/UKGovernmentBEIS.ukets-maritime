import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { MonoTypeOperatorFunction, of } from 'rxjs';

import { TasksAssignmentService, TasksReleaseService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { PendingRequestService } from '@netz/common/services';
import { RequestTaskStore } from '@netz/common/store';

import { BasePage, mockClass } from '../../testing';
import { ChangeAssigneeComponent } from './change-assignee.component';

describe('ChangeAssigneeComponent', () => {
  let page: Page;
  let store: RequestTaskStore;
  let authStore: AuthStore;
  let fixture: ComponentFixture<ChangeAssigneeComponent>;
  let component: ChangeAssigneeComponent;
  let router: Router;

  const tasksAssignmentService = mockClass(TasksAssignmentService);
  const pendingRequestService = mockClass(PendingRequestService);

  tasksAssignmentService.assignTask.mockReturnValue(of({}) as any);
  tasksAssignmentService.getCandidateAssigneesByTaskId.mockReturnValue(
    of([
      { id: '3954e888-40fb-4d6b-a367-6416b354ba08', firstName: 'Obi', lastName: 'Wan' },
      { id: '7b91199c-4770-4d4b-a0ed-d6d9667de157', firstName: 'Darth', lastName: 'Vader' },
    ]) as any,
  );
  pendingRequestService.trackRequest.mockReturnValue(((source$) => source$) as MonoTypeOperatorFunction<unknown>);

  class Page extends BasePage<ChangeAssigneeComponent> {
    get select(): HTMLSelectElement {
      return this.query('select');
    }
    get button(): HTMLButtonElement {
      return this.query('button');
    }
    get options(): string[] {
      return Array.from(this.select.options).map((option) => option.textContent.trim());
    }

    set selectValue(value: string) {
      this.setInputValue('select', value);
    }

    get errorSummary(): HTMLDivElement {
      return this.query('.govuk-error-summary');
    }

    get errorSummaryErrorList() {
      return Array.from(this.query<HTMLDivElement>('.govuk-error-summary').querySelectorAll('a')).map((anchor) =>
        anchor.textContent.trim(),
      );
    }
  }

  const createComponent = async () => {
    fixture = TestBed.createComponent(ChangeAssigneeComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeAssigneeComponent],
      providers: [
        provideRouter([]),
        { provide: TasksAssignmentService, useValue: tasksAssignmentService },
        { provide: TasksReleaseService, useValue: mockClass(TasksReleaseService) },
        { provide: PendingRequestService, useValue: pendingRequestService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  describe('for operator', () => {
    beforeEach(async () => {
      authStore = TestBed.inject(AuthStore);
      authStore.setUserState({ roleType: 'OPERATOR' });
      store = TestBed.inject(RequestTaskStore);
      store.setRequestTaskItem({ requestTask: { id: 856, assigneeUserId: '7b91199c-4770-4d4b-a0ed-d6d9667de157' } });
    });

    it('should create', async () => {
      await createComponent();
      expect(component).toBeTruthy();
    });

    it('should populate the select with no currently selected and not release option', async () => {
      await createComponent();

      await fixture.whenStable();
      fixture.detectChanges();

      expect(page.options).toEqual(['Obi Wan']);
    });

    it('should display error if no assignee selected', async () => {
      await createComponent();
      const submitSpy = vi.spyOn(component, 'submit');

      page.button.click();
      fixture.detectChanges();

      expect(submitSpy).toHaveBeenCalledTimes(1);
      expect(tasksAssignmentService.assignTask).toHaveBeenCalledTimes(0);

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryErrorList).toEqual(['Select a person']);
    });

    it('should post assignment and emit submitted', async () => {
      await createComponent();
      const submitSpy = vi.spyOn(component, 'submit');
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      expect(tasksAssignmentService.assignTask).toHaveBeenCalledTimes(0);
      expect(submitSpy).toHaveBeenCalledTimes(0);

      page.selectValue = '3954e888-40fb-4d6b-a367-6416b354ba08';
      page.button.click();

      expect(tasksAssignmentService.assignTask).toHaveBeenCalledTimes(1);
      expect(tasksAssignmentService.assignTask).toHaveBeenCalledWith({
        taskId: 856,
        userId: '3954e888-40fb-4d6b-a367-6416b354ba08',
      });
      expect(submitSpy).toHaveBeenCalledTimes(1);
      expect(submitSpy).toHaveBeenCalledWith(856, '3954e888-40fb-4d6b-a367-6416b354ba08');
    });
  });

  describe('for regulator', () => {
    beforeEach(async () => {
      authStore = TestBed.inject(AuthStore);
      authStore.setUserState({ roleType: 'REGULATOR' });
      store = TestBed.inject(RequestTaskStore);
      store.setRequestTaskItem({ requestTask: { id: 856, assigneeUserId: '7b91199c-4770-4d4b-a0ed-d6d9667de157' } });
    });

    it('should create', async () => {
      await createComponent();
      expect(component).toBeTruthy();
    });

    it('should populate the select with no currently selected and with release option', async () => {
      await createComponent();
      expect(page.options).toEqual(['Unassigned', 'Obi Wan']);
    });

    it('should post assignment and emit submitted', async () => {
      await createComponent();
      const submitSpy = vi.spyOn(component, 'submit');
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      expect(tasksAssignmentService.assignTask).toHaveBeenCalledTimes(0);
      expect(submitSpy).toHaveBeenCalledTimes(0);

      page.selectValue = '3954e888-40fb-4d6b-a367-6416b354ba08';
      page.button.click();

      expect(tasksAssignmentService.assignTask).toHaveBeenCalledTimes(1);
      expect(tasksAssignmentService.assignTask).toHaveBeenCalledWith({
        taskId: 856,
        userId: '3954e888-40fb-4d6b-a367-6416b354ba08',
      });
      expect(submitSpy).toHaveBeenCalledTimes(1);
      expect(submitSpy).toHaveBeenCalledWith(856, '3954e888-40fb-4d6b-a367-6416b354ba08');
    });
  });
});
