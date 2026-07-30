import { inject, Provider } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { isAfter } from 'date-fns';

import { AerShipDetails, AerShipEmissions, EmpOperatorDetails, EmpShipEmissions, ShipDetails } from '@mrtm/api';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { getYearFromRequestId } from '@netz/common/utils';
import { GovukValidators, MessageValidatorFn } from '@netz/govuk-components';

import { REQUEST_TASK_COMMON_SUBTASK_STEPS_QUERY } from '@requests/+state';
import { empCommonQuery } from '@requests/common';
import { TASK_FORM } from '@requests/common/task-form.token';
import { isAer } from '@shared/utils';

const uniqueImoNumberValidation =
  (
    ships: AerShipEmissions[] | EmpShipEmissions[],
    shipId: string,
    operatorImoNumber: EmpOperatorDetails['imoNumber'],
    delegatedResponsibilityImoNumber?: string[],
  ): ValidatorFn =>
  (control: AbstractControl): ValidationErrors => {
    const imoNumbers = new Set<string>(
      [
        operatorImoNumber,
        delegatedResponsibilityImoNumber ?? [],
        ships.filter((x) => x.uniqueIdentifier !== shipId).map((x) => x?.details?.imoNumber),
      ]
        .flat()
        .filter(Boolean),
    );

    if (imoNumbers.has(control.value)) {
      return { imoNumber: 'This IMO number already exists. Enter a new IMO number' };
    }

    return null;
  };

export const basicShipDetailsFormProvider: Provider = {
  provide: TASK_FORM,
  deps: [FormBuilder, RequestTaskStore, ActivatedRoute],
  useFactory: (fb: FormBuilder, store: RequestTaskStore, activatedRoute: ActivatedRoute): FormGroup => {
    const commonSubtaskStepsQuery = inject(REQUEST_TASK_COMMON_SUBTASK_STEPS_QUERY);
    const shipId = activatedRoute.snapshot.params.shipId;
    const shipDetails = store.select(commonSubtaskStepsQuery.selectShip(shipId))()?.details;
    const taskType = store.select(requestTaskQuery.selectRequestTaskType);

    const baseFormGroup = {
      uniqueIdentifier: fb.control(shipId),
      imoNumber: fb.control<ShipDetails['imoNumber'] | null>(shipDetails?.imoNumber, {
        validators: [
          GovukValidators.required('Enter a IMO number'),
          GovukValidators.pattern(/^\d{7}$/, 'The IMO Number must be 7 digits long'),
          uniqueImoNumberValidation(
            store.select(commonSubtaskStepsQuery.selectShips)(),
            shipId,
            store.select(empCommonQuery.selectOperatorDetails)()?.imoNumber,
            (store.select(empCommonQuery.selectMandate)()?.registeredOwners ?? [])
              .map((registeredOwner) => registeredOwner?.imoNumber)
              .filter(Boolean),
          ),
        ],
      }),
      name: fb.control<ShipDetails['name'] | null>(shipDetails?.name, {
        validators: [
          GovukValidators.required('Enter a ship name'),
          GovukValidators.maxLength(255, 'Enter up to 255 characters'),
        ],
      }),
      type: fb.control<ShipDetails['type'] | null>(shipDetails?.type, {
        validators: [GovukValidators.required('Enter a type')],
      }),
      grossTonnage: fb.control<ShipDetails['grossTonnage'] | null>(shipDetails?.grossTonnage, {
        validators: [
          GovukValidators.required('Enter the gross tonnage'),
          GovukValidators.max(999999999, 'Enter maximum of 9 numbers'),
          GovukValidators.min(5000, 'Gross tonnage must be 5000t or more'),
          GovukValidators.integerNumber('Gross tonnage must be an integer number'),
        ],
      }),
      flagState: fb.control<ShipDetails['flagState'] | null>(shipDetails?.flagState, {
        validators: [GovukValidators.required('Enter a flag state')],
      }),
      iceClass: fb.control<ShipDetails['iceClass'] | null>(shipDetails?.iceClass, {
        updateOn: 'change',
        validators: [GovukValidators.required('Enter an ice class')],
      }),
      natureOfReportingResponsibility: fb.control<ShipDetails['natureOfReportingResponsibility'] | null>(
        shipDetails?.natureOfReportingResponsibility,
        { validators: [GovukValidators.required('Enter a nature of reporting responsibility')] },
      ),
    };

    if (isAer(taskType())) {
      const details = shipDetails as AerShipDetails;
      const reportingYear = getYearFromRequestId(store.select(requestTaskQuery.selectRequestId)());

      return fb.group(
        {
          ...baseFormGroup,
          allYear: fb.control<boolean>(details?.allYear ?? true, {
            validators: [GovukValidators.required('Select all year or a specific period')],
          }),
          from: fb.control<Date>(details?.from ? new Date(details?.from) : null, {
            validators: [
              GovukValidators.required('Enter a date'),
              reportingYearValidator(
                `The date must be within the reporting period of 1 January ${reportingYear} and 31 December ${reportingYear}`,
                reportingYear,
              ),
            ],
          }),
          to: fb.control<Date>(details?.to ? new Date(details?.to) : null, {
            validators: [
              GovukValidators.required('Enter a date'),
              reportingYearValidator(
                `The date must be within the reporting period of 1 January ${reportingYear} and 31 December ${reportingYear}`,
                reportingYear,
              ),
            ],
          }),
        },
        {
          updateOn: 'change',
          validators: [endDateLaterThanStartDateValidator()],
        },
      );
    }

    return fb.group(baseFormGroup);
  },
};

const reportingYearValidator = (message: string, reportingYear: string): MessageValidatorFn =>
  GovukValidators.builder(message, (control: FormControl<Date>): { [key: string]: boolean } | null => {
    if (
      control.value &&
      control.value instanceof Date &&
      (!reportingYear || control.value?.getFullYear() !== +reportingYear)
    ) {
      return { isOutsideReportingYear: true };
    }
    return null;
  });

const endDateLaterThanStartDateValidator = (): ValidatorFn => {
  return (group: UntypedFormGroup): ValidationErrors => {
    const fromDate = group.controls.from.value;
    const toDate = group.controls.to.value;

    if (fromDate instanceof Date && toDate instanceof Date && isAfter(fromDate, toDate)) {
      group.controls.to.setErrors({
        invalidFromToDate: `The reporting period end date must be the same as or after start date`,
      });
    } else {
      // Keep any existing errors and delete only those with invalidFromToDate key
      const existingValidationErrors = group.controls.to.errors;
      if (existingValidationErrors?.invalidFromToDate) {
        delete existingValidationErrors?.invalidFromToDate;
      }
      group.controls.to.setErrors(existingValidationErrors);
    }

    return null;
  };
};
