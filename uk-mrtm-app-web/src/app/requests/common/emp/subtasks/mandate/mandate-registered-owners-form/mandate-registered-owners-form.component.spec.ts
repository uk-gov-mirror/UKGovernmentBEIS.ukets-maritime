import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TaskService } from '@netz/common/forms';
import { MockType } from '@netz/common/testing';

import { MANDATE_REGISTERED_OWNER_FORM_MODE, MandateWizardStep } from '@requests/common/emp/subtasks/mandate';
import { MandateRegisteredOwnersFormComponent } from '@requests/common/emp/subtasks/mandate/mandate-registered-owners-form/mandate-registered-owners-form.component';
import { taskProviders } from '@requests/common/task.providers';

describe('MandateRegisteredOwnersFormComponent', () => {
  let component: MandateRegisteredOwnersFormComponent;
  let fixture: ComponentFixture<MandateRegisteredOwnersFormComponent>;
  const taskServiceMock: MockType<TaskService<any>> = {};

  beforeEach(() => {
    const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MandateRegisteredOwnersFormComponent],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: taskServiceMock },
        { provide: MANDATE_REGISTERED_OWNER_FORM_MODE, useValue: MandateWizardStep.REGISTERED_OWNERS_FORM_ADD },
        ...taskProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MandateRegisteredOwnersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
