import { ChangeDetectionStrategy, Component, input, OnInit, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonDirective, DetailsComponent, FormGroupComponent, LinkDirective } from '@netz/govuk-components';

import { FilterByShipAndDateRange } from '@requests/common/components/list-filter-forms/filter-by-ship-and-date-range/filter-by-ship-and-date-range.interface';
import {
  arrivalDepartureDateValidator,
  datesBothOrNoneValidator,
} from '@requests/common/components/list-filter-forms/filter-by-ship-and-date-range/filter-by-ship-and-date-range.validators';
import {
  ALL_SHIPS_VALUE,
  ListFilterFormsCommon,
} from '@requests/common/components/list-filter-forms/list-filter-forms-common.directive';
import { AutocompleteSelectComponent } from '@shared/components/autocomplete-select';
import { DatePickerComponent } from '@shared/components/date-picker';

@Component({
  selector: 'mrtm-filter-by-ship-and-date-range',
  imports: [
    ReactiveFormsModule,
    ButtonDirective,
    AutocompleteSelectComponent,
    DatePickerComponent,
    DetailsComponent,
    LinkDirective,
    RouterLink,
    FormGroupComponent,
  ],
  standalone: true,
  templateUrl: './filter-by-ship-and-date-range.component.html',
  styleUrl: './filter-by-ship-and-date-range.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterByShipAndDateRangeComponent
  extends ListFilterFormsCommon<FilterByShipAndDateRange | null>
  implements OnInit
{
  readonly type = input.required<'ports' | 'voyages'>();

  private readonly detailsRef = viewChild.required('details', { read: DetailsComponent });
  readonly openDetailsOnRerender = signal<boolean>(false);

  protected readonly EMPTY_FORM_STATE = {
    filterByShip: ALL_SHIPS_VALUE,
    dates: {
      arrivalDate: null,
      departureDate: null,
    },
  };

  protected readonly EMPTY_FILTER_STATE: FilterByShipAndDateRange = {
    imoNumber: null,
    shipName: '',
    arrivalDate: null,
    departureDate: null,
  };
  protected readonly filterState = signal<FilterByShipAndDateRange>(this.EMPTY_FILTER_STATE);

  private readonly arrivalDate = new FormControl<Date>(null);
  private readonly departureDate = new FormControl<Date>(null);
  private readonly datesFormGroup = new FormGroup(
    {
      arrivalDate: this.arrivalDate,
      departureDate: this.departureDate,
    },
    [datesBothOrNoneValidator()],
  );
  readonly formGroup = new FormGroup({
    filterByShip: this.filterByShip,
    dates: this.datesFormGroup,
  });

  ngOnInit(): void {
    this.datesFormGroup.addValidators([arrivalDepartureDateValidator(this.type())]);
    this.datesFormGroup.updateValueAndValidity();
  }

  getFilterState(): FilterByShipAndDateRange {
    const imoNumber = this.filterByShip.value?.data;
    const shipName = this.filterByShip.value?.text ?? '';

    return {
      imoNumber,
      shipName,
      arrivalDate: this.arrivalDate.value,
      departureDate: this.departureDate.value,
    };
  }

  setFilterState(filterState: FilterByShipAndDateRange) {
    this.formGroup.setValue({
      filterByShip: {
        data: filterState?.imoNumber ?? ALL_SHIPS_VALUE.data,
        text: filterState?.shipName ?? '',
      },
      dates: {
        arrivalDate: filterState?.arrivalDate ?? null,
        departureDate: filterState?.departureDate ?? null,
      },
    });
  }

  protected override runPostSubmitSideEffects(): void {
    this.openDetailsOnRerender.set(this.detailsRef().isOpen);
  }
}
