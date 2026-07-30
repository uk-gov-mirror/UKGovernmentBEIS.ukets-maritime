import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ButtonDirective } from '@netz/govuk-components';

import { FilterByShip } from '@requests/common/components/list-filter-forms/filter-by-ship/filter-by-ship.interface';
import {
  ALL_SHIPS_VALUE,
  ListFilterFormsCommon,
} from '@requests/common/components/list-filter-forms/list-filter-forms-common.directive';
import { AutocompleteSelectComponent } from '@shared/components/autocomplete-select';

@Component({
  selector: 'mrtm-filter-by-ship',
  imports: [ReactiveFormsModule, ButtonDirective, AutocompleteSelectComponent],
  standalone: true,
  templateUrl: './filter-by-ship.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterByShipComponent extends ListFilterFormsCommon<FilterByShip | null> {
  protected readonly EMPTY_FORM_STATE = { filterByShip: ALL_SHIPS_VALUE };
  protected readonly EMPTY_FILTER_STATE: FilterByShip = { imoNumber: null, shipName: '' };
  protected readonly filterState = signal<FilterByShip>(this.initialFilterState() ?? this.EMPTY_FILTER_STATE);

  readonly formGroup = new FormGroup({ filterByShip: this.filterByShip });

  getFilterState(): FilterByShip {
    const imoNumber = this.filterByShip.value?.data;
    const shipName = this.filterByShip.value?.text ?? '';
    return { imoNumber, shipName };
  }

  setFilterState(filterState: FilterByShip) {
    this.formGroup.setValue({
      filterByShip: {
        data: filterState?.imoNumber ?? ALL_SHIPS_VALUE.data,
        text: filterState?.shipName ?? '',
      },
    });
  }
}
