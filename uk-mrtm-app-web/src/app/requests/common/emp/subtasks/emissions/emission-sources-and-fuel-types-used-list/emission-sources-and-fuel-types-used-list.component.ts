import { ChangeDetectionStrategy, Component, computed, inject, input, signal, WritableSignal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { take } from 'rxjs';

import { EmpEmissionsSources } from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, WarningTextComponent } from '@netz/govuk-components';

import { TaskItemStatus } from '@requests/common';
import { EMISSION_SOURCES_AND_FUEL_TYPES_USED_FORM_STEP } from '@requests/common/components/emissions/emission-sources-and-fuel-types-used-form/emission-sources-and-fuel-types-used-form.helper';
import { buildEmpEmissionSourceValidationFormGroup } from '@requests/common/components/emissions/emission-sources-and-fuel-types-used-form/emission-sources-and-fuel-types-used-form.provider';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { ShipStepTitleCustomPipe } from '@requests/common/components/emissions/pipes';
import { ReturnToShipsListTableComponent } from '@requests/common/components/emissions/return-to-ships-list-table';
import { empCommonQuery } from '@requests/common/emp/+state';
import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { emissionsSourcesItemValidator, emissionsSourcesValidator } from '@requests/common/emp/subtasks/emissions';
import { EmissionsWizardStep } from '@requests/common/emp/subtasks/emissions/emissions.helpers';
import { emissionShipSubtasksMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { findNotAssociatedFuelFactors } from '@requests/common/utils/emissions';
import { EmissionSourcesAndFuelTypesUsedSummaryTemplateComponent, XmlErrorSummaryComponent } from '@shared/components';
import { FuelOriginTitlePipe } from '@shared/pipes';
import { NestedMessageValidationError, XmlValidationError } from '@shared/types';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-emp-emission-sources-and-fuel-types-used-list',
  imports: [
    EmissionSourcesAndFuelTypesUsedSummaryTemplateComponent,
    PageHeadingComponent,
    ShipStepTitleCustomPipe,
    ButtonDirective,
    ReturnToShipsListTableComponent,
    XmlErrorSummaryComponent,
    WarningTextComponent,
  ],
  standalone: true,
  templateUrl: './emission-sources-and-fuel-types-used-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmissionSourcesAndFuelTypesUsedListComponent {
  private readonly fuelTitlePipe: FuelOriginTitlePipe = new FuelOriginTitlePipe();
  private readonly taskService = inject(TaskService<EmpTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly shipId = input<string>();
  readonly emissionSources = computed(() => {
    const sectionsCompleted = this.store.select(empCommonQuery.selectEmpSectionsCompleted)();
    return this.store
      .select(empCommonQuery.selectShipEmissionSources(this.shipId()))()
      .map((emission) => ({
        ...emission,
        needsReview:
          !emissionsSourcesItemValidator(emission) ||
          sectionsCompleted?.[`${EMISSION_SOURCES_AND_FUEL_TYPES_USED_FORM_STEP}-${emission.uniqueIdentifier}`] ===
            TaskItemStatus.NEEDS_REVIEW,
      }));
  });
  readonly fuelsAndEmissionsFactors = computed(() =>
    this.store.select(empCommonQuery.selectShipFuelsAndEmissionsFactors(this.shipId()))(),
  );
  readonly canContinue = computed(
    () =>
      emissionsSourcesValidator(this.emissionSources(), this.fuelsAndEmissionsFactors()) && !this.hasNeedsReviewItems(),
  );
  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable)();
  readonly taskMap = emissionShipSubtasksMap;
  readonly shipName = computed(() => this.store.select(empCommonQuery.selectShipName(this.shipId()))());
  readonly validationErrors: WritableSignal<Array<XmlValidationError>> = signal(undefined);
  readonly hasNeedsReviewItems = computed(
    () => !isNil(this.emissionSources().find((emissionSource) => emissionSource.needsReview)),
  );

  onAddItem() {
    this.router.navigate(['../../' + EmissionsWizardStep.EMISSION_SOURCES_FORM, crypto.randomUUID()], {
      relativeTo: this.route,
    });
  }

  onDelete(event: EmpEmissionsSources) {
    this.taskService
      .saveSubtask(EMISSIONS_SUB_TASK, EmissionsWizardStep.EMISSION_SOURCES_LIST, this.route, event.uniqueIdentifier)
      .pipe(take(1))
      .subscribe();
  }

  onContinue() {
    this.validationErrors.set(undefined);
    const errors: Array<XmlValidationError> = [];
    let isValid = true;

    for (const fuel of findNotAssociatedFuelFactors(this.emissionSources(), this.fuelsAndEmissionsFactors())) {
      errors.push({
        column: 'NO_FIELD',
        row: this.fuelTitlePipe.transform(fuel, false),
        message: 'All fuel types should be associated with at least one emission source',
      });
      isValid = false;
    }

    const needsReviewItems = this.emissionSources().filter((emissionSource) => emissionSource.needsReview);
    const resolvedIds = needsReviewItems
      .filter((emissionSource) => this.isEmissionSourceValid(emissionSource))
      .map((emissionSource) => emissionSource.uniqueIdentifier);

    if (resolvedIds.length < needsReviewItems.length) {
      errors.push({
        column: null,
        row: -1,
        message: 'The Potential fuel types used is missing for one or more emission sources',
      });
      isValid = false;
    }

    if (!isValid) {
      this.validationErrors.set(errors);
      return;
    }

    if (resolvedIds.length) {
      this.taskService
        .saveSubtask(EMISSIONS_SUB_TASK, EmissionsWizardStep.EMISSION_SOURCES_LIST, this.route, resolvedIds)
        .pipe(take(1))
        .subscribe(() =>
          this.router.navigate([`../../${EmissionsWizardStep.UNCERTAINTY_LEVEL}`], { relativeTo: this.route }),
        );
      return;
    }

    this.router.navigate([`../../${EmissionsWizardStep.UNCERTAINTY_LEVEL}`], { relativeTo: this.route });
  }

  private isEmissionSourceValid(emissionSource: EmpEmissionsSources): boolean {
    return buildEmpEmissionSourceValidationFormGroup(
      this.fb,
      emissionSource,
      this.emissionSources(),
      emissionSource.uniqueIdentifier,
      this.fuelsAndEmissionsFactors(),
    ).valid;
  }

  formatValidationErrorDetails(error: NestedMessageValidationError): string {
    return `Check the following fuel types: ${error.rows.map((row) => `<strong>${row}</strong>`).join(', ')}`;
  }
}
