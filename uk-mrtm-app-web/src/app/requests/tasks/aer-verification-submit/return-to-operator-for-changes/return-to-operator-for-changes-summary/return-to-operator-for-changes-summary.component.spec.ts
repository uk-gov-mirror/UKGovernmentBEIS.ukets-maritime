import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';

import { of } from 'rxjs';

import { TasksService } from '@mrtm/api';

import { ActivatedRouteStub, mockClass } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import {
  returnToOperatorForChangesQuery,
  ReturnToOperatorForChangesStore,
} from '@requests/tasks/aer-verification-submit/return-to-operator-for-changes/+state';
import { ReturnToOperatorForChangesSummaryComponent } from '@requests/tasks/aer-verification-submit/return-to-operator-for-changes/return-to-operator-for-changes-summary/return-to-operator-for-changes-summary.component';

describe('ReturnToOperatorForChangesSummaryComponent', () => {
  let component: ReturnToOperatorForChangesSummaryComponent;
  let fixture: ComponentFixture<ReturnToOperatorForChangesSummaryComponent>;
  let store: ReturnToOperatorForChangesStore;
  let router: Router;
  const tasksService = mockClass(TasksService);
  tasksService.processRequestTaskAction.mockReturnValue(of(null));
  const route = new ActivatedRouteStub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnToOperatorForChangesSummaryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TasksService, useValue: tasksService },
        { provide: ActivatedRoute, useValue: route },
        ...taskProviders,
      ],
    }).compileComponents();

    route.setUrl([new UrlSegment('/', {})]);
    store = TestBed.inject(ReturnToOperatorForChangesStore);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ReturnToOperatorForChangesSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display changes required summary text', () => {
    store.setState({
      isSubmitted: false,
      changesRequired: 'dolor sit amet',
    });
    fixture.detectChanges();
    const dlElements: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('dt, dd'));
    expect(dlElements.map((el) => el.textContent.trim())).toEqual([
      'Changes required from operator',
      'dolor sit amet',
      'Change',
    ]);
  });

  it('should redirect to success page when user completes the process', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    store.setState({
      isSubmitted: false,
      changesRequired: 'test test',
    });
    component.onSubmit();
    expect(store.select(returnToOperatorForChangesQuery.selectIsSubmitted)()).toEqual(true);
    expect(navigateSpy).toHaveBeenCalledWith(['../success'], { relativeTo: route });
  });
});
