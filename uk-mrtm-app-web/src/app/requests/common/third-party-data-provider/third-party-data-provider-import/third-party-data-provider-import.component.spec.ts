import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { createSelector } from '@netz/common/store';
import { MockType } from '@netz/common/testing';

import { SECTIONS_COMPLETED_SELECTOR, SUBTASKS_AFFECTED_BY_IMPORT } from '@requests/common/third-party-data-provider';
import { ThirdPartyDataProviderImportComponent } from '@requests/common/third-party-data-provider/third-party-data-provider-import';

describe('ThirdPartyDataProviderImportComponent', () => {
  let component: ThirdPartyDataProviderImportComponent;
  let fixture: ComponentFixture<ThirdPartyDataProviderImportComponent>;
  const mockTaskService: MockType<TaskService<unknown>> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThirdPartyDataProviderImportComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SUBTASKS_AFFECTED_BY_IMPORT, useValue: ['SUBTASK_1', 'SUBTASK_2'] },
        { provide: SECTIONS_COMPLETED_SELECTOR, useValue: createSelector((state) => state?.sectionsCompleted) },
        { provide: TaskService, useValue: mockTaskService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThirdPartyDataProviderImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
