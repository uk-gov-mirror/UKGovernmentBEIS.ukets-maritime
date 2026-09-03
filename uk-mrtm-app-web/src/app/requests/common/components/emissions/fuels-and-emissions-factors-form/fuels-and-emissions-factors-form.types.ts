import { FormControl } from '@angular/forms';

import { AerFuelsAndEmissionsFactors, EmpFuelsAndEmissionsFactors } from '@mrtm/api';

import { FuelType } from '@shared/types';

export type FuelsAndEmissionsFactorsExtended =
  AerFuelsAndEmissionsFactorsExtended | EmpFuelsAndEmissionsFactorsExtended;

export interface AerFuelsAndEmissionsFactorsExtended extends AerFuelsAndEmissionsFactors {
  type: FuelType;
}

export interface EmpFuelsAndEmissionsFactorsExtended extends EmpFuelsAndEmissionsFactors {
  type: FuelType;
}

export type FuelsAndEmissionsFactorsFormType = Omit<FuelsAndEmissionsFactorsExtended, 'sustainableFraction'> & {
  shipId: string;
  otherNitrousOxide: string | null;
};

export type EmpFuelsAndEmissionsFactorsFormType = FuelsAndEmissionsFactorsFormType &
  Partial<Pick<EmpFuelsAndEmissionsFactors, 'densityMethodBunker' | 'densityMethodTank'>>;

export type FuelsAndEmissionFactorsFormModel = Record<keyof FuelsAndEmissionsFactorsFormType, FormControl>;

export type EmpFuelsAndEmissionFactorsFormModel = Record<keyof EmpFuelsAndEmissionsFactorsFormType, FormControl>;
