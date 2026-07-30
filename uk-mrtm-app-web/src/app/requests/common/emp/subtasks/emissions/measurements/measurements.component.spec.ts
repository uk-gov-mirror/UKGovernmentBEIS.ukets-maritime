import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { BasePage, MockType } from '@netz/common/testing';

import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { EmissionsWizardStep } from '@requests/common/emp/subtasks/emissions/emissions.helpers';
import { MeasurementsComponent } from '@requests/common/emp/subtasks/emissions/measurements/measurements.component';
import { emissionsMock } from '@requests/common/emp/testing/emissions.mock';
import { mockEmpIssuanceSubmitRequestTask, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('MeasurementsComponent', () => {
  let component: MeasurementsComponent;
  let fixture: ComponentFixture<MeasurementsComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const taskService: MockType<TaskService<EmpTaskPayload>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');
  const route: any = { snapshot: { params: { shipId: emissionsMock.ships[0].uniqueIdentifier }, pathFromRoot: [] } };

  class Page extends BasePage<MeasurementsComponent> {
    getEmissionSourcesCheckboxes() {
      return this.queryAll<HTMLInputElement>('.govuk-checkboxes__input');
    }

    setName(value: string, index: number) {
      this.setInputValue(`#measurements.${index}.name`, value);
    }

    get addAnotherButton() {
      return this.queryAll<HTMLButtonElement>('button[govukSecondaryButton]').find(
        (el) => el.textContent.trim() === 'Add another measurement',
      );
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(MeasurementsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TaskService, useValue: taskService },
        { provide: ActivatedRoute, useValue: route },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new measurements question', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockEmpIssuanceSubmitRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Description of the measurement instruments involved');
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(2);
      expect(page.errorSummaryListContents).toEqual([
        'Enter the name of the measurement device',
        'Select the emission source this device is used for',
      ]);
    });
  });

  describe('for existing measurements question', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockStateBuild({ emissions: emissionsMock }, { emissions: TaskItemStatus.IN_PROGRESS }));
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Description of the measurement instruments involved');
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      page.addAnotherButton.click();
      fixture.detectChanges();
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummaryListContents).toEqual([
        'Enter the name of the measurement device',
        'Select the emission source this device is used for',
      ]);

      page.setName('Device 2', 2);
      page.getEmissionSourcesCheckboxes()[5].click();
      fixture.detectChanges();

      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(EMISSIONS_SUB_TASK, EmissionsWizardStep.MEASUREMENTS, route, {
        measurements: [
          ...emissionsMock.ships[0].measurements,
          {
            emissionSources: ['Main gas turbine'],
            name: 'Device 2',
            technicalDescription: null,
          },
        ],
        shipId: emissionsMock.ships[0].uniqueIdentifier,
      });
    });

    it(`should submit a valid form`, async () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(EMISSIONS_SUB_TASK, EmissionsWizardStep.MEASUREMENTS, route, {
        measurements: emissionsMock.ships[0].measurements,
        shipId: emissionsMock.ships[0].uniqueIdentifier,
      });
    });
  });
});
