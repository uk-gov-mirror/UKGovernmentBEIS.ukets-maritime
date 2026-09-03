import { ChangeDetectorRef, Component, DestroyRef, inject, input, InputSignal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { debounceTime } from 'rxjs';

import { AerPortEmissionsMeasurement } from '@mrtm/api';

import { FieldsetDirective, LegendDirective, TextInputComponent } from '@netz/govuk-components';

import { AerAggregatedEmissionsFormGroupModel } from '@requests/common/aer/components/aer-aggregated-emissions-form/aer-aggregated-emissions-form.types';
import { BigNumberPipe } from '@shared/pipes';
import { existingControlContainer } from '@shared/providers';
import { bigNumberUtils, isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-aer-aggregated-emissions-form',
  imports: [TextInputComponent, FieldsetDirective, LegendDirective, ReactiveFormsModule, BigNumberPipe],
  standalone: true,
  templateUrl: './aer-aggregated-emissions-form.component.html',
  viewProviders: [existingControlContainer],
})
export class AerAggregatedEmissionsFormComponent implements OnInit {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  readonly controlContainer = inject(ControlContainer);
  readonly header: InputSignal<string> = input<string>();
  readonly hint: InputSignal<string> = input<string>();
  readonly isNil = isNil;

  private get formGroup(): FormGroup<AerAggregatedEmissionsFormGroupModel> {
    return this.controlContainer?.control as FormGroup<AerAggregatedEmissionsFormGroupModel>;
  }

  ngOnInit() {
    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(200))
      .subscribe((value: AerPortEmissionsMeasurement) => {
        const { co2, ch4, n2o, total } = value;
        let newTotal = null;

        if ([co2, n2o, n2o].every((val) => !isNil(val) && `${val ?? ''}`.trim().length > 0)) {
          newTotal = bigNumberUtils.getSum([co2, n2o, ch4], 7);
        }

        this.controlContainer.control.get('total').setValue(newTotal, { emitEvent: newTotal !== total });
        this.cdr.markForCheck();
      });
  }
}
