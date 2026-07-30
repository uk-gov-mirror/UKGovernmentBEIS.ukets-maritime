import { FormGroup, ValidatorFn } from '@angular/forms';

import { AerAggregatedEmissionsFormGroupModel } from '@requests/common/aer/components';
import { isNil } from '@shared/utils';
import BigNumber from 'bignumber.js';

const totalEmissionsValidator =
  (message: string): ValidatorFn =>
  (abstractControl: FormGroup<AerAggregatedEmissionsFormGroupModel>) => {
    const { total } = abstractControl.value;
    if (abstractControl.valid && !isNil(total) && new BigNumber(total).lt(0)) {
      return {
        invalidGroupValues: message,
      };
    }
    return null;
  };

export const aerAggregatedDataValidators = {
  totalEmissionsValidator,
};
