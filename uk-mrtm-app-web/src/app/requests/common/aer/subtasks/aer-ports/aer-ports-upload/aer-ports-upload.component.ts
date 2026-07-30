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

import { AerFuelConsumption, AerPort, AerPortEmissionsMeasurement, FuelOriginTypeName } from '@mrtm/api';

import { FeedbackBannerStore } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective, TableComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload, FlattenedPort } from '@requests/common/aer/aer.types';
import { AER_PORTS_SUB_TASK, AerPortsWizardStep } from '@requests/common/aer/subtasks/aer-ports/aer-ports.helpers';
import { aerPortsMap } from '@requests/common/aer/subtasks/aer-ports/aer-ports-subtask-list.map';
import {
  aerPortCsvMap,
  aerPortsCSVMapper,
  AerPortUploadCSVFormModel,
} from '@requests/common/aer/subtasks/aer-ports/aer-ports-upload.map';
import { uploadPortsCsvColumns } from '@requests/common/aer/subtasks/aer-ports/aer-ports-upload/aer-ports-upload.constants';
import {
  addPortFormGroup,
  aerPortsUploadFormProvider,
  uploadPortCSVFormValidators,
} from '@requests/common/aer/subtasks/aer-ports/aer-ports-upload/aer-ports-upload.form-provider';
import {
  formatIsoDateTimeNoMs,
  generatePortUuid,
  generatePortUuidFromFlattened,
  hasDirectEmission,
  hasFuelConsumption,
} from '@requests/common/aer/subtasks/utils';
import { TASK_FORM } from '@requests/common/task-form.token';
import { DataParserWizardStepComponent } from '@shared/components';
import { AER_PORT_CODE_SELECT_ITEMS, AER_PORT_COUNTRY_SELECT_ITEMS } from '@shared/constants';
import { SelectOptionToTitlePipe } from '@shared/pipes';
import { PersistablePaginationService } from '@shared/services';
import { AerFuel, AerPortUploadCsvDto } from '@shared/types';
import { bigNumberUtils } from '@shared/utils';
import Papa from 'papaparse';

@Component({
  selector: 'mrtm-aer-ports-upload',
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
  templateUrl: './aer-ports-upload.component.html',
  providers: [aerPortsUploadFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerPortsUploadComponent {
  protected readonly form = inject<FormGroup<AerPortUploadCSVFormModel>>(TASK_FORM);
  private readonly persistablePaginationService = inject(PersistablePaginationService);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly taskService: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);

  private readonly dataParserWizardStep = viewChild.required(DataParserWizardStepComponent);

  wizardStep = AerPortsWizardStep;
  taskMap = aerPortsMap;
  countrySelectItems = AER_PORT_COUNTRY_SELECT_ITEMS;
  portSelectItems = AER_PORT_CODE_SELECT_ITEMS;
  columns = uploadPortsCsvColumns;
  portsCtrl = this.form.controls.ports;
  columnsCtrl = this.form.controls.columns;
  fileCtrl = this.form.controls.file;
  insertedRows = 0;
  updatedRows = 0;
  existingPorts = this.store.select(aerCommonQuery.selectPortEmissions)();
  readonly ports: WritableSignal<AerPort[] | null> = signal(null);
  readonly portsTableData: Signal<AerPortUploadCsvDto[]> = computed(() =>
    (this.ports() ?? []).map((item) => ({
      imoNumber: item.imoNumber,
      country: item.portDetails.visit.country,
      port: item.portDetails.visit.port,
      arrivalTime: item.portDetails.arrivalTime,
      departureTime: item.portDetails.departureTime,
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
    const processedData = aerPortsCSVMapper(result.data);

    this.columnsCtrl.setValue(result.meta.fields);
    this.portsCtrl.clear();
    this.portsCtrl.clearValidators();

    if (this.columnsCtrl.invalid) {
      this.displayColumnErrors();
    } else {
      processedData?.forEach((flattenedPort) => this.portsCtrl.push(addPortFormGroup(flattenedPort)));
      this.portsCtrl.addValidators(uploadPortCSVFormValidators(this.store));
      this.portsCtrl.updateValueAndValidity();

      if (this.portsCtrl.valid) {
        this.ports.update(() => this.getTransformedFormData(processedData));
      } else {
        this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
        this.ports.update(() => null);
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
      case aerPortCsvMap.visitPort:
        return trimmedValue === 'NA' ? 'NOT_APPLICABLE' : trimmedValue;

      case aerPortCsvMap.fuelConsumptionOrigin:
      case aerPortCsvMap.fuelConsumptionType:
      case aerPortCsvMap.fuelConsumptionMeasuringUnit:
        return trimmedValue === '' ? null : trimmedValue?.toUpperCase();

      default:
        return trimmedValue === '' ? null : trimmedValue;
    }
  }

  private getFuelConsumptions(fv: FlattenedPort): AerFuelConsumption[] {
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

  private getDirectEmission(fv: FlattenedPort): AerPortEmissionsMeasurement {
    return {
      co2: fv.directEmissionsCO2,
      ch4: fv.directEmissionsCH4,
      n2o: fv.directEmissionsN2O,
      total: bigNumberUtils.getSum([fv.directEmissionsCO2, fv.directEmissionsCH4, fv.directEmissionsN2O], 7),
    };
  }

  /**
   * Transforms FlattenedPort[] to AerPort[],
   * Updates entries in existing Ports
   * Creates or updates AerPort found in CSV between multiple lines
   */
  private getTransformedFormData(flattenedPorts: FlattenedPort[]): AerPort[] {
    const processedPortMap = new Map<string, AerPort>();
    const existingUuidPortIdMap = new Map<string, AerPort>();

    // Set map of generated Uuid and AerPort for each port from store
    this.existingPorts.forEach((item) => {
      existingUuidPortIdMap.set(
        generatePortUuid(
          item?.imoNumber,
          item?.portDetails?.visit?.country,
          item?.portDetails?.visit?.port,
          item?.portDetails?.arrivalTime,
          item?.portDetails?.departureTime,
        ),
        item,
      );
    });

    flattenedPorts.forEach((fv) => {
      const portUUID = generatePortUuidFromFlattened(fv);
      let currentPort = processedPortMap.get(portUUID);

      // Set currentPort when it exists in store
      if (!currentPort && existingUuidPortIdMap.has(portUUID)) {
        currentPort = existingUuidPortIdMap.get(portUUID);
      }

      if (currentPort) {
        currentPort = {
          ...currentPort,
          fuelConsumptions: [...currentPort.fuelConsumptions, ...this.getFuelConsumptions(fv)],
          ...(hasDirectEmission(fv) && { directEmissions: this.getDirectEmission(fv) }),
        };
        this.updatedRows++;
      } else {
        currentPort = {
          uniqueIdentifier: crypto.randomUUID(),
          imoNumber: fv.imoNumber,
          portDetails: {
            visit: {
              country: fv.visitCountry,
              port: fv.visitPort,
            },
            arrivalTime: formatIsoDateTimeNoMs(fv.arrivalDate, fv.arrivalActualTime),
            departureTime: formatIsoDateTimeNoMs(fv.departureDate, fv.departureActualTime),
          },
          fuelConsumptions: this.getFuelConsumptions(fv),
          ...(hasDirectEmission(fv) && { directEmissions: this.getDirectEmission(fv) }),
        } as AerPort;
        this.insertedRows++;
      }

      processedPortMap.set(portUUID, currentPort);
    });

    return Array.from(processedPortMap?.values());
  }

  /**
   * Since File errors should appear alone, temporarily set other formControl errors to null
   */
  private displayFileErrors() {
    this.columnsCtrl.setErrors(null);
    this.portsCtrl.setErrors(null);
    this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
    this.ports.update(() => null);
  }

  /**
   * Since Column errors should appear alone, temporarily set other formControl errors to null
   */
  private displayColumnErrors() {
    this.fileCtrl.setErrors(null);
    this.portsCtrl.setErrors(null);
    this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
    this.ports.update(() => null);
  }

  onSubmit() {
    this.persistablePaginationService.reset();
    this.taskService
      .saveSubtask(AER_PORTS_SUB_TASK, AerPortsWizardStep.UPLOAD_PORTS, this.activatedRoute, this.ports())
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
