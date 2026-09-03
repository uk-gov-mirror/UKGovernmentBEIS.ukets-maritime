import { ChangeDetectionStrategy, Component, computed, inject, input, signal, WritableSignal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { takeUntil } from 'rxjs';

import { EmissionsSources } from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { DestroySubject } from '@netz/common/services';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, WarningTextComponent } from '@netz/govuk-components';

import { TaskItemStatus } from '@requests/common';
import { aerCommonQuery } from '@requests/common/aer/+state';
import {
  aerEmissionsSourcesValidator,
  AerEmissionsWizardStep,
  emissionsSourcesItemValidator,
} from '@requests/common/aer/subtasks/aer-emissions/aer-emissions.helpers';
import { emissionsShipSubtaskMap, emissionsSubtaskMap } from '@requests/common/components/emissions';
import { EMISSION_SOURCES_AND_FUEL_TYPES_USED_FORM_STEP } from '@requests/common/components/emissions/emission-sources-and-fuel-types-used-form/emission-sources-and-fuel-types-used-form.helper';
import { buildAerEmissionSourceValidationFormGroup } from '@requests/common/components/emissions/emission-sources-and-fuel-types-used-form/emission-sources-and-fuel-types-used-form.provider';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { ReturnToShipsListTableComponent } from '@requests/common/components/emissions/return-to-ships-list-table';
import { findNotAssociatedFuelFactors } from '@requests/common/utils/emissions';
import {
  AerEmissionSourcesAndFuelTypesUsedSummaryTemplateComponent,
  XmlErrorSummaryComponent,
} from '@shared/components';
import { FuelOriginTitlePipe } from '@shared/pipes';
import { NestedMessageValidationError, XmlValidationError } from '@shared/types';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-aer-emission-sources-and-fuel-types-used-list',
  imports: [
    AerEmissionSourcesAndFuelTypesUsedSummaryTemplateComponent,
    PageHeadingComponent,
    ButtonDirective,
    ReturnToShipsListTableComponent,
    XmlErrorSummaryComponent,
    WarningTextComponent,
  ],
  standalone: true,
  templateUrl: './aer-emission-sources-and-fuel-types-used-list.component.html',
  providers: [DestroySubject],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerEmissionSourcesAndFuelTypesUsedListComponent {
  private readonly taskService = inject(TaskService);
  private readonly store = inject(RequestTaskStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = inject(DestroySubject);
  private readonly fb = inject(FormBuilder);
  private readonly fuelTitlePipe: FuelOriginTitlePipe = new FuelOriginTitlePipe();

  readonly shipId = input<string>();
  readonly emissionSources = computed(() => {
    const sectionsCompleted = this.store.select(aerCommonQuery.selectAerSectionsCompleted)();

    return this.store
      .select(aerCommonQuery.selectShipEmissionSources(this.shipId()))()
      .map((emission) => ({
        ...emission,
        needsReview:
          !emissionsSourcesItemValidator(emission) ||
          sectionsCompleted?.[`${EMISSION_SOURCES_AND_FUEL_TYPES_USED_FORM_STEP}-${emission.uniqueIdentifier}`] ===
            TaskItemStatus.NEEDS_REVIEW,
      }));
  });
  readonly fuelsAndEmissionsFactors = computed(() =>
    this.store.select(aerCommonQuery.selectShipFuelsAndEmissionsFactors(this.shipId()))(),
  );
  readonly canContinue = computed(
    () =>
      aerEmissionsSourcesValidator(this.emissionSources(), this.fuelsAndEmissionsFactors()) &&
      !this.hasNeedsReviewItems(),
  );
  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable)();
  readonly taskMap = emissionsShipSubtaskMap;
  readonly shipName = computed(() => this.store.select(aerCommonQuery.selectShipName(this.shipId()))());
  readonly returnToLabel = emissionsSubtaskMap.ships.title;
  readonly validationErrors: WritableSignal<Array<XmlValidationError>> = signal(undefined);
  readonly hasNeedsReviewItems = computed(
    () => !isNil(this.emissionSources().find((emissionSource) => emissionSource.needsReview)),
  );

  onAddItem(): void {
    this.router.navigate(['../../' + AerEmissionsWizardStep.EMISSION_SOURCES_FORM, crypto.randomUUID()], {
      relativeTo: this.route,
      queryParams: { change: true },
      queryParamsHandling: 'merge',
    });
  }

  onDelete(event: EmissionsSources) {
    this.taskService
      .saveSubtask(EMISSIONS_SUB_TASK, AerEmissionsWizardStep.EMISSION_SOURCES_LIST, this.route, event.uniqueIdentifier)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onContinue(): void {
    const errors: Array<XmlValidationError> = [];
    let isValid = true;

    if (!aerEmissionsSourcesValidator(this.emissionSources(), this.fuelsAndEmissionsFactors())) {
      for (const fuel of findNotAssociatedFuelFactors(this.emissionSources(), this.fuelsAndEmissionsFactors())) {
        errors.push({
          column: 'NO_FIELD',
          row: this.fuelTitlePipe.transform(fuel, false),
          message: 'All fuel types should be associated with at least one emission source',
        });
        isValid = false;
      }
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
        .saveSubtask(EMISSIONS_SUB_TASK, AerEmissionsWizardStep.EMISSION_SOURCES_LIST, this.route, resolvedIds)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() =>
          this.router.navigate([`../../${AerEmissionsWizardStep.UNCERTAINTY_LEVEL}`], { relativeTo: this.route }),
        );
      return;
    }

    this.router.navigate([`../../${AerEmissionsWizardStep.UNCERTAINTY_LEVEL}`], { relativeTo: this.route });
  }

  private isEmissionSourceValid(emissionSource: EmissionsSources): boolean {
    return buildAerEmissionSourceValidationFormGroup(
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
