import { InjectionToken, Provider } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { MrtmAccountUpdateDTO } from '@mrtm/api';

import { GovukValidators } from '@netz/govuk-components';

import { commencementDateValidator } from '@accounts/components/operator-account-form';
import { OperatorAccountsStore } from '@accounts/store';
import { ConfigService } from '@core/config';
import { getLocationStateFormGroup } from '@shared/components';
import { isNil } from '@shared/utils';

export const EDIT_OPERATOR_ACCOUNT_FORM: InjectionToken<string> = new InjectionToken('Edit operator account form');

export const editOperatorAccountFormProvider: Provider = {
  provide: EDIT_OPERATOR_ACCOUNT_FORM,
  deps: [FormBuilder, OperatorAccountsStore, ConfigService],
  useFactory: (
    formBuilder: FormBuilder,
    store: OperatorAccountsStore,
    configService: ConfigService,
  ): FormGroup<Record<keyof MrtmAccountUpdateDTO, FormControl>> => {
    const currentOperatorAccount = store.getState().currentAccount?.account;
    const firstMaritimeActivityDateValue = !isNil(currentOperatorAccount?.firstMaritimeActivityDate)
      ? new Date(currentOperatorAccount?.firstMaritimeActivityDate)
      : null;

    return formBuilder.group({
      name: new FormControl<MrtmAccountUpdateDTO['name'] | null>(currentOperatorAccount?.name, {
        validators: [
          GovukValidators.required('Enter operator’s name'),
          GovukValidators.maxLength(256, 'Operator name should not be more than 256 characters'),
        ],
      }),
      firstMaritimeActivityDate: new FormControl<MrtmAccountUpdateDTO['firstMaritimeActivityDate'] | Date | null>(
        firstMaritimeActivityDateValue,
        {
          validators: [
            GovukValidators.required('Enter the first year of reporting obligation'),
            commencementDateValidator(
              toSignal(configService.getConfigProperty('minYearOfFirstMrtmActivity'))(),
              firstMaritimeActivityDateValue,
            ),
          ],
        },
      ),
      sopId: new FormControl<MrtmAccountUpdateDTO['sopId'] | null>(currentOperatorAccount?.sopId, {
        validators: [
          GovukValidators.max(9999999999, 'The SOP ID should contain a maximum of 10 numbers'),
          GovukValidators.pattern(/^\d*$/, 'The SOP ID should contain numbers only'),
        ],
      }),
      reason: new FormControl<MrtmAccountUpdateDTO['reason'] | null>(null, {
        validators: [
          GovukValidators.required('Enter a reason'),
          GovukValidators.maxLength(10000, 'Enter up to 10000 characters'),
        ],
      }),
      ...getLocationStateFormGroup(currentOperatorAccount),
    });
  },
};
