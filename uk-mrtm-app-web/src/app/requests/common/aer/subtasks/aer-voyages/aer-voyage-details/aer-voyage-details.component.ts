import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  OnInit,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { AerShipEmissions } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { FieldsetDirective, LegendDirective, LinkDirective, SelectComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AER_SUBTASK_NEW_ENTRY_FLOW } from '@requests/common/aer/aer.consts';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { aerVoyageDetailsFormProvider } from '@requests/common/aer/subtasks/aer-voyages/aer-voyage-details/aer-voyage-details.form-provider';
import {
  AER_VOYAGES_SUB_TASK,
  AerVoyagesWizardStep,
} from '@requests/common/aer/subtasks/aer-voyages/aer-voyages.helpers';
import { aerVoyagesMap } from '@requests/common/aer/subtasks/aer-voyages/aer-voyages-subtask-list.map';
import { TASK_FORM } from '@requests/common/task-form.token';
import { DatePickerComponent, DatePickerConfig, TimeInputComponent, WizardStepComponent } from '@shared/components';
import { AER_PORT_CODE_SELECT_ITEMS, AER_PORT_COUNTRY_SELECT_ITEMS } from '@shared/constants';

@Component({
  selector: 'mrtm-aer-voyage-details',
  imports: [
    WizardStepComponent,
    ReactiveFormsModule,
    SelectComponent,
    TimeInputComponent,
    RouterLink,
    LinkDirective,
    DatePickerComponent,
    FieldsetDirective,
    LegendDirective,
  ],
  standalone: true,
  templateUrl: './aer-voyage-details.component.html',
  providers: [aerVoyageDetailsFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerVoyageDetailsComponent implements OnInit {
  protected readonly form: FormGroup = inject(TASK_FORM);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly taskService: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  public readonly isAddNewVoyage = inject(AER_SUBTASK_NEW_ENTRY_FLOW, { optional: true });
  public readonly voyageId: InputSignal<string> = input<string>();
  public readonly wizardMap = aerVoyagesMap;
  public readonly countrySelectItems = AER_PORT_COUNTRY_SELECT_ITEMS;
  private readonly currentArrivalCountry = toSignal(this.arrivalCountryCtrl.valueChanges.pipe(), {
    initialValue: this.arrivalCountryCtrl.value,
  });
  private readonly departureArrivalCountry = toSignal(this.departureCountryCtrl.valueChanges.pipe(), {
    initialValue: this.departureCountryCtrl.value,
  });
  readonly ship: Signal<AerShipEmissions> = computed(() => {
    const port = this.store.select(aerCommonQuery.selectVoyage(this.voyageId()))();

    return this.store.select(aerCommonQuery.selectShipByImoNumber(port?.imoNumber))();
  });
  readonly portArrivalSelectItems = computed(() => {
    const country = this.currentArrivalCountry();
    return !country
      ? []
      : AER_PORT_CODE_SELECT_ITEMS.filter((item) => item.countryCode === country || item.value === 'NOT_APPLICABLE');
  });
  readonly portDepartureSelectItems = computed(() => {
    const country = this.departureArrivalCountry();
    return !country
      ? []
      : AER_PORT_CODE_SELECT_ITEMS.filter((item) => item.countryCode === country || item.value === 'NOT_APPLICABLE');
  });

  private get arrivalCountryCtrl(): AbstractControl {
    return this.form.get('arrivalCountry');
  }

  private get departureCountryCtrl(): AbstractControl {
    return this.form.get('departureCountry');
  }

  private get arrivalPortCtrl(): AbstractControl {
    return this.form.get('arrivalPort');
  }

  private get departurePortCtrl(): AbstractControl {
    return this.form.get('departurePort');
  }

  get datepickerConfig(): DatePickerConfig {
    const reportingYear = this.store.select(aerCommonQuery.selectReportingYear)();
    return {
      minDate: `01/01/${reportingYear}`,
      maxDate: `31/12/${reportingYear}`,
      weekStartDay: 'Monday',
      leadingZeros: false,
    };
  }

  ngOnInit(): void {
    this.arrivalCountryCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.arrivalPortCtrl.setValue(null);
    });
    this.departureCountryCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.departurePortCtrl.setValue(null);
    });
  }

  onSubmit(): void {
    this.taskService
      .saveSubtask(AER_VOYAGES_SUB_TASK, AerVoyagesWizardStep.VOYAGE_DETAILS, this.activatedRoute, this.form.value)
      .pipe(take(1))
      .subscribe();
  }
}
