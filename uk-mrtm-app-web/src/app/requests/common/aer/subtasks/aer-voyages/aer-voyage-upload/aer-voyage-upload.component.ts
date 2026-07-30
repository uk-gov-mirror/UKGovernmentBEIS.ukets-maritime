import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AerFuelConsumption, AerPortEmissionsMeasurement, AerVoyage, FuelOriginTypeName } from '@mrtm/api';

import { FeedbackBannerStore } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective, TableComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload, FlattenedVoyage } from '@requests/common/aer/aer.types';
import {
  aerVoyageCsvMap,
  aerVoyagesCSVMapper,
  AerVoyageUploadCSVFormModel,
} from '@requests/common/aer/subtasks/aer-voyages/aer-voyage-upload.map';
import { uploadVoyagesCsvColumns } from '@requests/common/aer/subtasks/aer-voyages/aer-voyage-upload/aer-voyage-upload.constants';
import {
  addVoyageFormGroup,
  aerVoyageUploadFormProvider,
  uploadVoyageCSVFormValidators,
} from '@requests/common/aer/subtasks/aer-voyages/aer-voyage-upload/aer-voyage-upload.form-provider';
import {
  AER_VOYAGES_SUB_TASK,
  AerVoyagesWizardStep,
} from '@requests/common/aer/subtasks/aer-voyages/aer-voyages.helpers';
import { aerVoyagesMap } from '@requests/common/aer/subtasks/aer-voyages/aer-voyages-subtask-list.map';
import {
  formatIsoDateTimeNoMs,
  generateVoyageUuid,
  generateVoyageUuidFromFlattened,
  hasDirectEmission,
  hasFuelConsumption,
} from '@requests/common/aer/subtasks/utils';
import { TASK_FORM } from '@requests/common/task-form.token';
import { DataParserWizardStepComponent } from '@shared/components';
import { AER_PORT_CODE_SELECT_ITEMS } from '@shared/constants';
import { SelectOptionToTitlePipe } from '@shared/pipes';
import { PersistablePaginationService } from '@shared/services';
import { AerFuel, AerVoyageUploadCsvDto } from '@shared/types';
import { bigNumberUtils } from '@shared/utils';
import Papa from 'papaparse';

@Component({
  selector: 'mrtm-aer-voyage-upload',
  imports: [
    DataParserWizardStepComponent,
    LinkDirective,
    ButtonDirective,
    TableComponent,
    DatePipe,
    SelectOptionToTitlePipe,
    RouterLink,
  ],
  standalone: true,
  templateUrl: './aer-voyage-upload.component.html',
  providers: [aerVoyageUploadFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerVoyageUploadComponent {
  protected readonly form = inject<FormGroup<AerVoyageUploadCSVFormModel>>(TASK_FORM);
  private readonly persistablePaginationService = inject(PersistablePaginationService);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly taskService: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);

  private readonly dataParserWizardStep = viewChild.required(DataParserWizardStepComponent);

  wizardStep = AerVoyagesWizardStep;
  taskMap = aerVoyagesMap;
  portSelectItems = AER_PORT_CODE_SELECT_ITEMS;
  columns = uploadVoyagesCsvColumns;
  voyagesCtrl = this.form.controls.voyages;
  columnsCtrl = this.form.controls.columns;
  fileCtrl = this.form.controls.file;
  insertedRows = 0;
  updatedRows = 0;
  existingVoyages = this.store.select(aerCommonQuery.selectVoyageEmissions)();
  readonly voyages: WritableSignal<AerVoyage[] | null> = signal(null);
  readonly voyagesTableData: Signal<AerVoyageUploadCsvDto[]> = computed(() =>
    (this.voyages() ?? []).map((item) => ({
      imoNumber: item.imoNumber,
      departurePort: item.voyageDetails.departurePort.port,
      departureTime: item.voyageDetails.departureTime,
      arrivalPort: item.voyageDetails.arrivalPort.port,
      arrivalTime: item.voyageDetails.arrivalTime,
    })),
  );
  uploadedFile: File;

  onFileSelect(event: any) {
    this.insertedRows = 0;
    this.updatedRows = 0;
    this.dataParserWizardStep().isSummaryDisplayedSubject.next(false);
    this.uploadedFile = event.target.files[0];
    this.fileCtrl.setValue(this.uploadedFile);

    if (this.fileCtrl.invalid) {
      this.displayFileErrors();
    } else {
      Papa.parse(this.uploadedFile, {
        header: true,
        transform: this.csvValuesTransformer,
        skipEmptyLines: true,
        complete: (result) => this.processCSVData(result),
      });
    }

    event.target.value = '';
  }

  private processCSVData(result: Papa.ParseResult<unknown>) {
    const processedData = aerVoyagesCSVMapper(result.data);

    this.columnsCtrl.setValue(result.meta.fields);
    this.voyagesCtrl.clear();
    this.voyagesCtrl.clearValidators();

    if (this.columnsCtrl.invalid) {
      this.displayColumnErrors();
    } else {
      processedData?.forEach((flattenedVoyage) => this.voyagesCtrl.push(addVoyageFormGroup(flattenedVoyage)));
      this.voyagesCtrl.addValidators(uploadVoyageCSVFormValidators(this.store));
      this.voyagesCtrl.updateValueAndValidity();

      if (this.voyagesCtrl.valid) {
        this.voyages.update(() => this.getTransformedFormData(processedData));
      } else {
        this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
        this.voyages.update(() => null);
      }
    }
  }

  /**
   * Transforms a CSV value and trims its content
   * If is empty string to null
   * If is of boolean type, then convert 'Yes', 'YES', 'NO' etc. to true or false
   * If is of fuelOriginType, then convert 'fossil'/'biofuel' to 'FOSSIL'/'BIOFUEL'
   */
  private csvValuesTransformer(value: string, field: string) {
    const trimmedValue = value?.trim();
    switch (field) {
      case aerVoyageCsvMap.departurePort:
      case aerVoyageCsvMap.arrivalPort:
        return trimmedValue === 'NA' ? 'NOT_APPLICABLE' : trimmedValue;

      case aerVoyageCsvMap.fuelConsumptionOrigin:
      case aerVoyageCsvMap.fuelConsumptionType:
      case aerVoyageCsvMap.fuelConsumptionMeasuringUnit:
        return trimmedValue === '' ? null : trimmedValue?.toUpperCase();

      default:
        return trimmedValue === '' ? null : trimmedValue;
    }
  }

  private getFuelConsumptions(fv: FlattenedVoyage): AerFuelConsumption[] {
    const matchedFuelEmissionFactor = this.store.select(
      aerCommonQuery.selectShipFuelOriginMethaneCombination(
        fv.imoNumber,
        fv.fuelConsumptionOrigin,
        fv.fuelConsumptionType as unknown as AerFuel['type'],
        fv?.fuelConsumptionEmissionSourceName,
        fv?.fuelConsumptionMethaneSlip,
      ),
    )();
    const matchedEmissionSource = this.store.select(
      aerCommonQuery.selectShipEmissionSourceByName(fv.imoNumber, fv.fuelConsumptionEmissionSourceName),
    )();

    return hasFuelConsumption(fv)
      ? [
          {
            uniqueIdentifier: crypto.randomUUID(),
            name: matchedEmissionSource ? matchedEmissionSource.name : null,
            amount: fv.fuelConsumptionAmount,
            measuringUnit: fv.fuelConsumptionMeasuringUnit,
            fuelDensity: fv.fuelConsumptionFuelDensity,
            fuelOriginTypeName: {
              uniqueIdentifier: matchedFuelEmissionFactor?.uniqueIdentifier,
              origin: matchedFuelEmissionFactor?.origin,
              type: matchedFuelEmissionFactor?.type,
              name: matchedFuelEmissionFactor?.name,
              methaneSlip: fv.fuelConsumptionMethaneSlip,
            } as FuelOriginTypeName,
          } as AerFuelConsumption,
        ]
      : [];
  }

  private getDirectEmission(fv: FlattenedVoyage): AerPortEmissionsMeasurement {
    return {
      co2: fv.directEmissionsCO2,
      ch4: fv.directEmissionsCH4,
      n2o: fv.directEmissionsN2O,
      total: bigNumberUtils.getSum([fv.directEmissionsCO2, fv.directEmissionsCH4, fv.directEmissionsN2O], 7),
    };
  }

  /**
   * Transforms FlattenedVoyage[] to AerVoyage[],
   * Updates entries in existing Voyages
   * Creates or updates AerVoyage found in CSV between multiple lines
   */
  private getTransformedFormData(flattenedVoyages: FlattenedVoyage[]): AerVoyage[] {
    const processedVoyageMap = new Map<string, AerVoyage>();
    const existingUuidVoyageIdMap = new Map<string, AerVoyage>();

    // Set map of generated Uuid and AerVoyage for each voyage from store
    this.existingVoyages.forEach((item) => {
      existingUuidVoyageIdMap.set(
        generateVoyageUuid(
          item?.imoNumber,
          item?.voyageDetails?.departurePort?.country,
          item?.voyageDetails?.departurePort?.port,
          item?.voyageDetails?.departureTime,
          item?.voyageDetails?.arrivalPort?.country,
          item?.voyageDetails?.arrivalPort?.port,
          item?.voyageDetails?.arrivalTime,
        ),
        item,
      );
    });

    flattenedVoyages.forEach((fv) => {
      const voyageUUID = generateVoyageUuidFromFlattened(fv);
      let currentVoyage = processedVoyageMap.get(voyageUUID);

      // Set currentVoyage when it exists in store
      if (!currentVoyage && existingUuidVoyageIdMap.has(voyageUUID)) {
        currentVoyage = existingUuidVoyageIdMap.get(voyageUUID);
      }

      if (currentVoyage) {
        currentVoyage = {
          ...currentVoyage,
          fuelConsumptions: [...currentVoyage.fuelConsumptions, ...this.getFuelConsumptions(fv)],
          ...(hasDirectEmission(fv) && { directEmissions: this.getDirectEmission(fv) }),
        };
        this.updatedRows++;
      } else {
        currentVoyage = {
          uniqueIdentifier: crypto.randomUUID(),
          imoNumber: fv.imoNumber,
          voyageDetails: {
            departurePort: {
              country: fv.departureCountry,
              port: fv.departurePort,
            },
            departureTime: formatIsoDateTimeNoMs(fv.departureDate, fv.departureActualTime),
            arrivalPort: {
              country: fv.arrivalCountry,
              port: fv.arrivalPort,
            },
            arrivalTime: formatIsoDateTimeNoMs(fv.arrivalDate, fv.arrivalActualTime),
          },
          fuelConsumptions: this.getFuelConsumptions(fv),
          ...(hasDirectEmission(fv) && { directEmissions: this.getDirectEmission(fv) }),
        } as AerVoyage;
        this.insertedRows++;
      }

      processedVoyageMap.set(voyageUUID, currentVoyage);
    });

    return Array.from(processedVoyageMap?.values());
  }

  /**
   * Since File errors should appear alone, temporarily set other formControl errors to null
   */
  private displayFileErrors() {
    this.columnsCtrl.setErrors(null);
    this.voyagesCtrl.setErrors(null);
    this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
    this.voyages.update(() => null);
  }

  /**
   * Since Column errors should appear alone, temporarily set other formControl errors to null
   */
  private displayColumnErrors() {
    this.fileCtrl.setErrors(null);
    this.voyagesCtrl.setErrors(null);
    this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
    this.voyages.update(() => null);
  }

  onSubmit() {
    this.persistablePaginationService.reset();
    this.taskService
      .saveSubtask(AER_VOYAGES_SUB_TASK, AerVoyagesWizardStep.UPLOAD_VOYAGES, this.activatedRoute, this.voyages())
      .subscribe(() => {
        const messages = [];
        if (this.insertedRows > 0) {
          messages.push(`${this.insertedRows} row(s) added successfully`);
        }

        if (this.updatedRows > 0) {
          messages.push(`${this.updatedRows} row(s) updated successfully`);
        }

        if (this.insertedRows > 0 || this.updatedRows > 0) {
          this.feedbackBannerStore.setSuccessMessages(messages);
        }
      });
  }
}
