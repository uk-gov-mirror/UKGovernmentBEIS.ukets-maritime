import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { empVariationRegulatorQuery } from '@requests/common/emp/+state';

@Component({
  selector: 'mrtm-emp-variation-regulator-action-buttons',
  imports: [ButtonDirective, RouterLink],
  standalone: true,
  template: `
    @if (canBeDisplayed()) {
      <div class="govuk-button-group">
        <a govukButton [routerLink]="['emp-variation-regulator', 'notify-operator']">Notify operator of decision</a>
        <a govukSecondaryButton [routerLink]="['emp-variation-regulator', 'peer-review']">Send for peer review</a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpVariationRegulatorActionButtonsComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);

  readonly canBeDisplayed = computed(
    () =>
      this.store.select(requestTaskQuery.selectIsEditable)() &&
      this.store.select(empVariationRegulatorQuery.selectAreAllSectionsAccepted)(),
  );
}
