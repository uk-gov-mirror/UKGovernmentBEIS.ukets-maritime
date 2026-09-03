import { Provider } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { EmpOperatorDetails, EmpRegisteredOwner, EmpShipEmissions } from '@mrtm/api';

import { RequestTaskStore } from '@netz/common/store';
import { GovukValidators } from '@netz/govuk-components';

import { empCommonQuery } from '@requests/common/emp/+state';
import { MANDATE_REGISTERED_OWNER_PARAM } from '@requests/common/emp/subtasks/mandate';
import {
  MandateRegisteredOwnersFormGroupModel,
  MandateRegisteredOwnersFormModel,
} from '@requests/common/emp/subtasks/mandate/mandate-registered-owners-form/mandate-registered-owners-form.types';
import { TASK_FORM } from '@requests/common/task-form.token';
import { isNil } from '@shared/utils';
import { todayOrPastDateValidator } from '@shared/validators';

const uniqueImoNumberValidation =
  (
    registeredOwners: Array<EmpRegisteredOwner>,
    registeredOwnerId: EmpRegisteredOwner['uniqueIdentifier'],
    ships: Array<EmpShipEmissions>,
    companyImoNumber: EmpOperatorDetails['imoNumber'],
  ): ValidatorFn =>
  (control: AbstractControl): ValidationErrors => {
    const currentValue = control.value;

    if (
      (registeredOwners ?? []).filter(
        (registeredOwner) =>
          registeredOwner.uniqueIdentifier !== registeredOwnerId && registeredOwner?.imoNumber === currentValue,
      ).length > 0 ||
      companyImoNumber === currentValue ||
      ships.some((ship) => ship?.details?.imoNumber === currentValue)
    ) {
      return { imoNumber: 'The IMO number you entered is already in use. Enter a unique IMO number' };
    }

    return null;
  };

export const mandateRegisteredOwnersFormProvider: Provider = {
  provide: TASK_FORM,
  deps: [FormBuilder, RequestTaskStore, ActivatedRoute],
  useFactory: (
    formBuilder: FormBuilder,
    store: RequestTaskStore,
    activatedRoute: ActivatedRoute,
  ): FormGroup<MandateRegisteredOwnersFormGroupModel> => {
    const registeredOwnerId = activatedRoute.snapshot.params?.[MANDATE_REGISTERED_OWNER_PARAM];
    const registeredOwner = store.select(
      empCommonQuery.selectMandateRegisteredOwnerByUniqueIdentifier(registeredOwnerId),
    )();
    const uniqueIdentifier = registeredOwner?.uniqueIdentifier ?? crypto.randomUUID();
    const availableShips = store.select(empCommonQuery.selectMandateRegisteredOwnerAvailableShips(uniqueIdentifier))();

    return formBuilder.group({
      uniqueIdentifier: formBuilder.control<MandateRegisteredOwnersFormModel['uniqueIdentifier'] | null>(
        uniqueIdentifier,
      ),
      name: formBuilder.control<MandateRegisteredOwnersFormModel['name'] | null>(registeredOwner?.name, {
        validators: [
          GovukValidators.required('Enter a registered owner name'),
          GovukValidators.maxLength(255, 'The registered owner name must be 255 characters or less'),
        ],
      }),
      imoNumber: formBuilder.control<MandateRegisteredOwnersFormModel['imoNumber'] | null>(registeredOwner?.imoNumber, {
        validators: [
          GovukValidators.required('Enter an IMO number'),
          GovukValidators.pattern(/^\d{7}$/, 'The IMO Number must be 7 digits'),
          uniqueImoNumberValidation(
            store.select(empCommonQuery.selectMandateRegisteredOwners)(),
            registeredOwnerId,
            store.select(empCommonQuery.selectShips)(),
            store.select(empCommonQuery.selectOperatorDetails)()?.imoNumber,
          ),
        ],
      }),
      contactName: formBuilder.control<MandateRegisteredOwnersFormModel['contactName'] | null>(
        registeredOwner?.contactName,
        {
          validators: [
            GovukValidators.required('Enter a contact name'),
            GovukValidators.maxLength(255, 'The contact name must be 255 characters or less'),
          ],
        },
      ),
      email: formBuilder.control<MandateRegisteredOwnersFormModel['email'] | null>(registeredOwner?.email, {
        validators: [
          GovukValidators.required('Enter an email address'),
          GovukValidators.email('Enter an email address in the correct format, like name@example.com'),
        ],
      }),
      effectiveDate: formBuilder.control<Date | null>(
        !isNil(registeredOwner?.effectiveDate) ? new Date(registeredOwner?.effectiveDate) : null,
        {
          validators: [
            GovukValidators.required('Enter the date of written agreement'),
            todayOrPastDateValidator('The date of written agreement'),
          ],
        },
      ),
      ships: formBuilder.control<MandateRegisteredOwnersFormModel['ships'] | null>(
        registeredOwner?.ships?.filter(
          (ship) => !!availableShips.find((availableShip) => availableShip.imoNumber === ship.imoNumber),
        ),
        {
          validators: [
            GovukValidators.required(
              availableShips?.length
                ? 'Select at least one ship to associate with the registered owner'
                : 'No ships are available to associate with this registered owner',
            ),
          ],
        },
      ),
    });
  },
};
