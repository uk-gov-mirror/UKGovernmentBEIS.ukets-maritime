import { Component, inject, input } from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';

import { AddressDTO } from '@mrtm/api';

import {
  FieldsetDirective,
  FieldsetHintDirective,
  LegendDirective,
  LegendSizeType,
  SelectComponent,
  TextInputComponent,
} from '@netz/govuk-components';

import { CountriesDirective, NotProvidedDirective } from '@shared/directives';
import { OptionalFieldLabelPipe } from '@shared/pipes';
import { existingControlContainer } from '@shared/providers/control-container.factory';

type LocationModelType = AddressDTO & { state?: string };

@Component({
  selector: 'mrtm-location-state-form',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    SelectComponent,
    CountriesDirective,
    OptionalFieldLabelPipe,
    FieldsetDirective,
    LegendDirective,
    FieldsetHintDirective,
    NotProvidedDirective,
  ],
  standalone: true,
  templateUrl: './location-state-form.component.html',
  viewProviders: [existingControlContainer],
})
export class LocationStateFormComponent {
  public readonly controlContainer = inject(ControlContainer);
  public readonly withState = input<boolean>(true);
  public readonly optionalFields = input<Partial<Record<keyof LocationModelType, boolean>>>({
    postcode: true,
    line2: true,
    state: true,
  });
  public readonly legendLabel = input.required<string>();
  public readonly legendHint = input<string>();
  public readonly legendSize = input<LegendSizeType>('medium');
  public readonly hiddenLegend = input<boolean>(false);
  public readonly isReadonly = input<boolean>(false);
}
