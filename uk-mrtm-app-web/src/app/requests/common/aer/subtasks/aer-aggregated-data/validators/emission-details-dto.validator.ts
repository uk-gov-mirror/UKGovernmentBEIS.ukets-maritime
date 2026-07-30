import {
  AerAggregatedDataFuelConsumption,
  AerPortEmissionsMeasurementSave,
  AerShipAggregatedDataSave,
  AerShipEmissions,
} from '@mrtm/api';

import { RequestTaskStore } from '@netz/common/store';

import { aerCommonQuery } from '@requests/common/aer/+state';
import {
  AnnualConsumptionEditDTO,
  EmissionDetailsDTO,
} from '@requests/common/aer/subtasks/aer-aggregated-data/interfaces';
import { XmlValidationError } from '@shared/types';
import { bigNumberUtils } from '@shared/utils';
import { XmlValidator } from '@shared/validators';
import BigNumber from 'bignumber.js';

export class EmissionDetailsDtoValidator {
  private static isShipImoNumberValid(value?: EmissionDetailsDTO['shipImoNumber']): boolean {
    const shipImoNumberRegex = new RegExp('^\\d{7}$');
    return shipImoNumberRegex.test(value);
  }

  private static isShipUnique(
    shipData: AerShipAggregatedDataSave[],
    value?: EmissionDetailsDTO['shipImoNumber'],
  ): boolean {
    const allImoNumbers = shipData?.map((item) => item?.imoNumber);
    return !allImoNumbers.includes(value?.toString());
  }

  private static isEmissionsValid(emissions: AerPortEmissionsMeasurementSave[]) {
    const allValuesValid = emissions.every(
      (emission) =>
        XmlValidator.maxDecimalValidator(emission?.co2, true, 12, 7) &&
        XmlValidator.maxDecimalValidator(emission?.ch4, true, 12, 7) &&
        XmlValidator.maxDecimalValidator(emission?.n2o, true, 12, 7),
    );
    const allGreenHouseValues = emissions.flatMap((emission) => [emission.co2, emission.ch4, emission.n2o]);
    const total = bigNumberUtils.getSum(allGreenHouseValues, 7);

    return allValuesValid && BigNumber(total).gte(0);
  }

  private static allAnnualConsumptionsValid(
    store: RequestTaskStore,
    ship: AerShipEmissions,
    consumptions: AnnualConsumptionEditDTO[],
  ): boolean {
    return consumptions?.every((consumption: AnnualConsumptionEditDTO) => {
      const fuel =
        consumption?.fuelTypeCode === 'OTHER'
          ? store.select(
              aerCommonQuery.selectShipFuelOriginTypeNameCombination(
                ship?.details?.imoNumber,
                consumption?.otherFuelType,
                consumption?.fuelOriginCode,
                consumption?.fuelTypeCode,
              ),
            )()
          : store.select(
              aerCommonQuery.selectShipFuelOriginTypeCombination(
                ship?.details?.imoNumber,
                consumption?.fuelOriginCode,
                consumption?.fuelTypeCode,
              ),
            )();

      return fuel && XmlValidator.maxDecimalValidator(consumption?.amount, true, 12, 5);
    });
  }

  private static transformAnnualConsumptionEditDTOs(
    store: RequestTaskStore,
    ship: AerShipEmissions,
    consumptions: AnnualConsumptionEditDTO[],
  ): AerAggregatedDataFuelConsumption[] {
    return consumptions?.map((consumption: AnnualConsumptionEditDTO) => {
      const fuel =
        consumption?.fuelTypeCode === 'OTHER'
          ? store.select(
              aerCommonQuery.selectShipFuelOriginTypeNameCombination(
                ship?.details?.imoNumber,
                consumption?.otherFuelType,
                consumption?.fuelOriginCode,
                consumption?.fuelTypeCode,
              ),
            )()
          : store.select(
              aerCommonQuery.selectShipFuelOriginTypeCombination(
                ship?.details?.imoNumber,
                consumption?.fuelOriginCode,
                consumption?.fuelTypeCode,
              ),
            )();

      return {
        fuelOriginTypeName: {
          uniqueIdentifier: fuel?.uniqueIdentifier,
          origin: fuel?.origin,
          type: fuel?.type,
          name: fuel?.name,
        },
        totalConsumption: consumption?.amount?.toString(),
      };
    });
  }

  /**
   * Validates and transforms from EmissionDetailsDTO to AerShipAggregatedDataSave
   */
  public static transformEmissionDetailsDTO(
    store: RequestTaskStore,
    emissionDetails: EmissionDetailsDTO,
  ): AerShipAggregatedDataSave | null {
    const ship = store.select(aerCommonQuery.selectShipByImoNumber(emissionDetails?.shipImoNumber))();

    const emissionsWithinUKPorts = {
      co2: emissionDetails?.annualEmission?.etsEmissionsWithinUkPort?.tco2Total?.toString(),
      ch4: emissionDetails?.annualEmission?.etsEmissionsWithinUkPort?.tch4eqTotal?.toString(),
      n2o: emissionDetails?.annualEmission?.etsEmissionsWithinUkPort?.tn2oeqTotal?.toString(),
    };
    const emissionsBetweenUKPorts = {
      co2: emissionDetails?.annualEmission?.etsEmissionsBetweenUkPort?.tco2Total?.toString(),
      ch4: emissionDetails?.annualEmission?.etsEmissionsBetweenUkPort?.tch4eqTotal?.toString(),
      n2o: emissionDetails?.annualEmission?.etsEmissionsBetweenUkPort?.tn2oeqTotal?.toString(),
    };
    const emissionsBetweenUKAndNIVoyages = {
      co2: emissionDetails?.annualEmission?.etsEmissionsBetweenUkAndNiPort?.tco2Total?.toString(),
      ch4: emissionDetails?.annualEmission?.etsEmissionsBetweenUkAndNiPort?.tch4eqTotal?.toString(),
      n2o: emissionDetails?.annualEmission?.etsEmissionsBetweenUkAndNiPort?.tn2oeqTotal?.toString(),
    };

    if (
      this.allAnnualConsumptionsValid(store, ship, emissionDetails?.annualEmission?.emissions) &&
      this.isEmissionsValid([emissionsWithinUKPorts, emissionsBetweenUKPorts, emissionsBetweenUKAndNIVoyages])
    ) {
      return {
        uniqueIdentifier: crypto.randomUUID(),
        imoNumber: emissionDetails.shipImoNumber?.toString(),
        emissionsWithinUKPorts: emissionsWithinUKPorts,
        emissionsBetweenUKPorts: emissionsBetweenUKPorts,
        emissionsBetweenUKAndNIVoyages: emissionsBetweenUKAndNIVoyages,
        fuelConsumptions: this.transformAnnualConsumptionEditDTOs(
          store,
          ship,
          emissionDetails?.annualEmission?.emissions,
        ),
        fromFetch: false,
        dataInputType: 'MANUAL',
      };
    }

    return null;
  }

  public static shipImoNumberDTOPartialError = (
    index: number,
    shipData: AerShipAggregatedDataSave[],
    emissionDetails?: EmissionDetailsDTO,
  ): XmlValidationError[] => {
    const errors: XmlValidationError[] = [];

    if (!this.isShipUnique(shipData, emissionDetails?.shipImoNumber)) {
      errors.push({
        row: index + 1,
        column: 'shipImoNumber',
        message: 'There are duplicated IMO numbers in the file. Check the information entered and reupload the file',
      });
    }

    if (!this.isShipImoNumberValid(emissionDetails?.shipImoNumber)) {
      errors.push({
        row: index + 1,
        column: 'shipImoNumber',
        message: 'The IMO Number must be 7 digits and is required',
      });
    }

    return errors;
  };

  /**
   * Validates whether the XML contains more than 1000 EmissionDetailsDTO.
   * Validation should happen after all generic file validations, but before any other validation for EmissionDetailsDTO.
   */
  public static maxAllowedShipEmissionError(emissionReports: EmissionDetailsDTO[]): XmlValidationError[] {
    if (emissionReports?.length > 1000) {
      return [{ row: null, column: null, message: 'The maximum number of ships allowed is 1000' }];
    }

    return [];
  }
}
